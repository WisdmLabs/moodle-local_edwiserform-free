<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * @package   local_edwiserform
 * @copyright WisdmLabs 2018
 * @author Yogesh Shirsath
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();
require_once($CFG->dirroot . "/local/edwiserform/lib.php");

class efb_list_form_data implements renderable, templatable
{
	/**
     *
     * @var Integer Form id, this will be the form id to edit or it can be the null in case of the new form creation.
     */
    private $formid         = null;
    private $plugin         = null;

    public function __construct($formid = null)
    {
        global $DB;
        $this->formid = $formid;
        $this->form = $DB->get_record('efb_forms', array('id' => $this->formid));
        $this->plugin = $this->form->type == 'blank' ? null : get_plugin($this->form->type);
        $this->supportsubmission = $this->form->type == 'blank' ? true : $this->plugin->can_save_data();
    }


    public function export_for_template(\renderer_base $output)
    {
        global $DB, $CFG;
        $data = new stdClass();
        if (!$this->supportsubmission) {
            $data->submissionnotsupport = get_string("efb-form-data-submission-not-supported", "local_edwiserform");
            return $data;
        }
        $data->formid = $this->formid;
        $headings = $this->get_headings();
        if (empty($headings)) {
            $data->nodata = get_string("efb-form-data-no-data", "local_edwiserform");
            return $data;
        }
        $data->heading = $this->form->title;
        $data->headings = array(get_string("efb-form-data-heading-user", "local_edwiserform"));
        $data->pageactions = $this->get_page_actions();
        $supportActions = isset($this->plugin) && $this->plugin->support_form_data_list_actions();
        if ($supportActions) {
            $data->headings[] = get_string("efb-form-data-heading-action", "local_edwiserform");
        }
        if ($headings) {
            $headingsmap = $this->get_name_label_map();
            foreach ($headings as $value) {
                $value = isset($headingsmap[$value]) ? $headingsmap[$value] : $value;
                $data->headings[] = ucfirst($value);
            }
            $forms = $DB->get_records('efb_form_data', array('formid' => $this->formid));
            $data->rows = [];
            foreach ($forms as $form) {
                $formdata = [];
                $submission = $form->submission;
                $submission = json_decode($submission);
                list($usql, $uparams) = $DB->get_in_or_equal($form->userid);
                $sql = "SELECT id," . get_all_user_name_fields(true) . " FROM {user} WHERE id " . $usql;
                if ($user = $DB->get_record_sql($sql, $uparams)) {
                    $userlink = new moodle_url('/user/profile.php', array('id' => $form->userid));
                    $formdata[] = html_writer::tag('a', fullname($user), array('href' => $userlink, 'target' => '_blank', 'class' => 'formdata-user', 'data-userid' => $form->userid));
                } else {
                    $formdata[] = '-';
                }
                if ($supportActions) {
                    $formdata[] = $this->plugin->form_data_list_actions($form);
                }
                $submittedData = array_fill_keys($headings, null);
                $formdata = array_merge($formdata, $submittedData);
                foreach ($submission as $elem) {
                    $value = $elem->value;
                    if (isset($formdata[$elem->name])) {
                        if (!is_array($formdata[$elem->name])) {
                            $formdata[$elem->name] = array($formdata[$elem->name]);
                        }
                        $formdata[$elem->name][] = $value;
                        $value = $formdata[$elem->name];
                    }
                    $formdata[$elem->name] = $value;
                }
                $formdata = array_values($formdata);
                foreach ($formdata as $key => $value) {
                    if (is_array($value)) {
                        $formdata[$key] = html_writer::start_tag('ul');
                        $formdata[$key] .= html_writer::start_tag('li');
                        $formdata[$key] .= implode($value, "</li><li>");
                        $formdata[$key] .= html_writer::end_tag('li');
                        $formdata[$key] .= html_writer::end_tag('ul');
                    }
                }
                $data->rows[] = array('data' => $formdata);
            }
        }
        return $data;
    }

    private function get_name_label_map() {
        global $DB;
        $def = $this->form->definition;
        if (!$def) {
            return false;
        }
        $def = json_decode($def, true);
        $fields = $def["fields"];
        $map = [];
        foreach ($fields as $field) {
            if (isset($field["attrs"]["name"]) && !isset($map[$field["attrs"]["name"]])) {
                $map[$field["attrs"]["name"]] = $field["config"]["label"];
            }
        }
        return $map;
    }

    public function get_headings() {
        global $DB;
        $def = $this->form->definition;
        if (!$def) {
            return false;
        }
        $def = json_decode($def, true);
        $fields = $def["fields"];
        $headings = [];
        foreach ($fields as $field) {
            switch ($field["tag"]) {
                case "input":
                case "select":
                case "textarea":
                    $headings[] = $field["attrs"]["name"];
                    break;
            }
        }
        if (!count($headings)) {
            return false;
        }
        return $headings;
    }



    private function get_page_actions() {
        $actions = array(
            array(
                'url' => new moodle_url('/local/edwiserform/view.php', array('page' => 'newform')),
                'label' => get_string('efb-heading-newform', 'local_edwiserform'),
                'icon'  => 'edit'
            ),
            array(
                'url' => new moodle_url('/local/edwiserform/view.php', array('page' => 'listforms')),
                'label' => get_string('efb-heading-listforms', 'local_edwiserform'),
                'icon'  => 'list'
            )
        );
        return $actions;
    }
}
