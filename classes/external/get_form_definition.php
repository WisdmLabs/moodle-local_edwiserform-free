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
 * @package     local_edwiserform
 * @copyright   2018 WisdmLabs <support@wisdmlabs.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @author      Yogesh Shirsath
 */

namespace local_edwiserform\external;

defined('MOODLE_INTERNAL') || die();

use external_function_parameters;
use external_value;
use html_writer;
use moodle_url;

trait get_form_definition {

    public static function get_form_definition_parameters() {
        return new external_function_parameters(
                array(
            'form_id' => new external_value(PARAM_INT, 'Form id found in shortcode.', VALUE_REQUIRED),
                )
        );
    }

    public static function get_form_definition($formid) {
        global $DB, $CFG, $USER;
        $responce = array(
            'status' => false,
            'title' => '',
            'definition' => '',
            'formtype' => 'blank',
            'action' => '',
            'data' => '',
            'msg' => get_string("efb-form-not-found", "local_edwiserform", ''.$formid),
        );
        if ($formid > 0) {
            $form = $DB->get_record('efb_forms', array('id' => $formid));
            if (!$form || $form->deleted) {
                return $responce;
            }
            if (!$form->enabled) {
                $responce['msg'] = get_string("efb-form-not-enabled", "local_edwiserform", ''.$form->title);
                return $responce;
            }
            $params = array('form_id' => $formid);
            $responce["form_id"] = $formid;
            $plugin = null;
            if ($form->type != 'blank') {
                $plugin = get_plugin($form->type);
            }
            if (empty($USER->id)) {
                if ($form->type == 'blank' || $plugin->login_required()) {
                    $link = html_writer::link(new moodle_url($CFG->wwroot . "/login/index.php"), get_string("efb-form-loggedin-required-click", "local_edwiserform"));
                    $responce["msg"] = get_string("efb-form-loggedin-required", "local_edwiserform", $link);
                    return $responce;
                }
            } else {
                if ($form->type != 'blank' && !$plugin->login_allowed()) {
                    $responce["msg"] = get_string("efb-form-loggedin-not-allowed", "local_edwiserform");
                    return $responce;
                }
            }
            $responce["formtype"] = $form->type;
            $responce["title"] = $form->title;
            self::validate_form($form, $plugin, $responce);
            if ($form->type != 'blank') {
                $responce['action']  = $plugin->get_action_url();
            }
        }
        return $responce;
    }

    public static function is_form_deleted($formid) {
        global $DB;
        return $DB->get_field('efb_forms', 'deleted', array('id' => $formid));
    }

    public static function validate_form($form, $plugin, &$responce) {
        $canuser = self::can_save_data($form, $plugin);
        switch ($canuser['status']) {
            case 0:
                $responce["msg"] = get_string("efb-form-cannot-submit", "local_edwiserform");
                break;
            case 2:
                $responce["data"] = $canuser["data"];
            case 1:
                $responce["definition"] = $form->definition;
                $responce["msg"] = get_string("efb-form-definition-found", "local_edwiserform");
                $responce["status"] = true;
                break;
            default:
                $responce["msg"] = get_string("efb-unknown-error", "local_edwiserform");
                break;
        }
        if ($form->type != 'blank') {
            $responce['data'] = $plugin->attach_data($form, $responce["data"]);
        }
        return $responce;
    }

    public static function can_save_data($form, $plugin) {
        global $DB, $USER;
        $responce = ['status' => 1];
        if ($USER->id == 0) {
            return $responce;
        }
        if ($plugin != null && $plugin->support_multiple_submissions()) {
            return $responce;
        }
        $formid = $form->id;
        $sql = "SELECT f.type, f.data_edit, fd.submission FROM {efb_forms} f
                  JOIN {efb_form_data} fd ON f.id = fd.formid
                 WHERE f.id = ?
                   AND fd.userid = ?";
        $form = $DB->get_record_sql($sql, array($formid, $USER->id));
        if ($form && ($form->type == 'blank' || $plugin->can_save_data())) {
            if ($form->data_edit) {
                $responce['data'] = $form->submission;
                $responce['status'] = 2;
            } else {
                $responce['status'] = 0;
            }
        }
        return $responce;
    }

    public static function get_form_definition_returns() {
        return new \external_single_structure(
            [
                'status' => new external_value(PARAM_BOOL, 'Form status.'),
                'title' => new external_value(PARAM_TEXT, 'Form title'),
                'definition'    => new external_value(PARAM_RAW, 'Form data or message.'),
                'formtype' => new external_value(PARAM_TEXT, 'Form type.'),
                'action' => new external_value(PARAM_TEXT, 'Form action'),
                'data' => new external_value(PARAM_TEXT, 'Form data if previous submission present'),
                'msg' => new external_value(PARAM_RAW, 'Form definition status')
            ]
        );
    }

}
