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
 * Description of efb_list_form
 * @package   local_edwiserform
 * @copyright WisdmLabs
 * @author sudam
 * @author Yogesh Shirsath
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
defined('MOODLE_INTERNAL') || die();

class efb_list_form implements renderable, templatable {

    public function export_for_template(\renderer_base $output) {
        $data = new stdClass();
        $data->heading = "Forms";
        $data->headings = array(
            get_string("efb-tbl-heading-title", "local_edwiserform"),
            get_string("efb-tbl-heading-type", "local_edwiserform"),
            get_string("efb-tbl-heading-shortcode", "local_edwiserform"),
            get_string("efb-tbl-heading-author", "local_edwiserform"),
            get_string("efb-tbl-heading-created", "local_edwiserform"),
            get_string("efb-tbl-heading-modified", "local_edwiserform"),
            get_string("efb-tbl-heading-action", "local_edwiserform"),
        );
        $formslist = $this->get_forms_list();
        $data->pageactions = $this->get_page_actions();
        if (!empty($formslist)) {
            $data->rows = $formslist;
        } else {
            $data->norowsmsg = "No data in table to show.";
        }
        return $data;
    }

    private function get_page_actions() {
        $actions = array(
            array(
                'url' => new moodle_url('/local/edwiserform/view.php', array('page' => 'newform')),
                'label' => get_string('efb-heading-newform', 'local_edwiserform')
            )
        );
        return $actions;
    }

    private function get_form_actions($form) {
        global $DB, $CFG;
        $edit = array(
            "icon" => "icon fa fa-edit fa-fw text-primary",
            "title" => get_string("efb-form-action-edit-title", "local_edwiserform"),
            "attrs" => array(
                ["key" => "class", "value" => "efb-form-edit"],
                ["key" => "href", "value" => new moodle_url("/local/edwiserform/view.php", array("page" => "newform", "formid" => $form->id))]
            )
        );
        $preview = array(
            "icon" => "icon fa fa-eye fa-fw text-primary",
            "title" => get_string("efb-form-action-preview-title", "local_edwiserform"),
            "attrs" => array(
                ["key" => "class", "value" => "efb-form-preview"],
                ["key" => "target", "value" => "_blank"],
                ["key" => "href", "value" => new moodle_url("/local/edwiserform/preview.php", array("id" => $form->id))]
            )
        );
        $export = array(
            "icon" => "icon fa fa-share-square-o fa-fw text-primary",
            "title" => get_string("efb-form-action-export-title", "local_edwiserform"),
            "attrs" => array(
                ["key" => "class", "value" => "efb-form-export"],
                ["key" => "target", "value" => "_blank"],
                ["key" => "href", "value" => new moodle_url("/local/edwiserform/export.php", array("id" => $form->id))]
            )
        );
        $delete = array(
            "icon" => "icon fa fa-trash fa-fw text-primary",
            "title" => get_string("efb-form-action-delete-title", "local_edwiserform"),
            "attrs" => array(
                ["key" => "class", "value" => "efb-form-delete"],
                ["key" => "target", "value" => "_blank"],
                ["key" => "href", "value" => "#"]
            )
        );
        $view_data = array(
            "icon" => "icon fa fa-table fa-fw text-primary",
            "title" => get_string("efb-form-action-view-data-title", "local_edwiserform"),
            "attrs" => array(
                ["key" => "class", "value" => "efb-form-view-data"],
                ["key" => "target", "value" => "_blank"],
                ["key" => "href", "value" => new moodle_url("/local/edwiserform/view.php", array("page" => "viewdata", "formid" => $form->id))]
            )
        );
        $enabled = $form->type == "login" ? get_config("core", "alternateloginurl") : $form->enabled;
        $enabledisable = "";
        $enabletitle = get_string('efb-form-action-enable-title', 'local_edwiserform');
        $disabletitle = get_string('efb-form-action-disable-title', 'local_edwiserform');
        $enabledisable .= html_writer::start_tag('label', array('class' => 'efb-switch', 'title' => $enabled ? $disabletitle : $enabletitle));
        $enabledisable .= html_writer::checkbox('efb-switch-input', '', $enabled, '', array('data-formid' => $form->id, 'data-enable-title' => $enabletitle, 'data-disable-title' => $disabletitle));
        $enabledisable .= html_writer::tag('span', '', array('class' => 'efb-slider bg-primary efb-enable-disable-form'));
        $enabledisable .= html_writer::end_tag('label');
        $actions[] = array(
            "html" => $enabledisable,
        );
        $actions[] = $preview;
        if ($form->type == 'blank') {
            $actions[] = $view_data;
        } else {
            $plugin = get_plugin($form->type);
            if ($plugin->can_save_data()) {
                $actions[] = $view_data;
            }
        }
        switch ($form->type) {
            case "blank":
            case "contact":
            case "enrolment";
        }
        $actions[] = $edit;
        $actions[] = $export;
        $actions[] = $delete;
        return $actions;
    }

    private function get_forms_list() {
        global $DB, $USER;
        $rows = array();

        // $stmt = "select * from {efb_forms} where author=?";
        // Selecting only those forms which are not deleted
        $stmt = "SELECT * FROM {efb_forms} WHERE deleted = 0";
        $param = [];
        if (!is_siteadmin()) {
            $stmt .= " author=?";
            $param[] = $USER->id;
        }
        $records = $DB->get_records_sql($stmt, $param);
        foreach ($records as $record) {
            $data = array(
                "id" => $record->id,
                "title" => $record->title,
                "type" => $record->type,
                "author" => $this->get_user_name($record->author),
                "created" => $record->created,
                "modified" => empty($record->modified) ? $record->created : $record->modified,
                "actions" => $this->get_form_actions($record),
            );
            $rows[] = $data;
        }
        return $rows;
    }

    private function get_user_name($userid) {
        global $DB;
        $user = $DB->get_record("user", array("id" => $userid), "username");
        return \ucfirst($user->username);
    }

}
