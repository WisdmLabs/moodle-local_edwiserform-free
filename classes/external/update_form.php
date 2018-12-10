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
 * @author      Sudam
 */

namespace local_edwiserform\external;

defined('MOODLE_INTERNAL') || die();

use external_function_parameters;
use external_value;
use context_system;

trait update_form {

    public static function update_form_parameters() {
        return new external_function_parameters(
            array(
                "setting" => new \external_single_structure(
                    array(
                        'id' => new external_value(PARAM_INT, 'Form id', VALUE_REQUIRED),
                        'title' => new external_value(PARAM_TEXT, 'Form title', VALUE_REQUIRED),
                        'description' => new external_value(PARAM_TEXT, 'Form description.', VALUE_OPTIONAL),
                        'data_edit' => new external_value(PARAM_BOOL, 'Is form editable. Boolean true/flase', VALUE_REQUIRED),
                        'type' => new external_value(PARAM_TEXT, 'Type of the form', VALUE_REQUIRED),
                        'notifi_email' => new external_value(PARAM_TEXT, 'Notification email address. This value is required if the form type is contact us', VALUE_OPTIONAL),
                        'message' => new external_value(PARAM_RAW, 'Message to show after successfull submission', VALUE_OPTIONAL),
                        "draftitemid" => new external_value(PARAM_INT, 'Draft item id form message', VALUE_OPTIONAL),
                        'eventsettings' => new external_value(PARAM_RAW, 'Event settings', VALUE_OPTIONAL)
                    )
                ),
                'formdef' => new external_value(PARAM_RAW, 'Form signuture in json format.', VALUE_REQUIRED),
            )
        );
    }

    public static function update_form($settings, $formdef) {
        global $CFG;
        require_once($CFG->dirroot . "/local/edwiserform/lib.php");
        $responce = array(
            'status' => false,
            'msg' => get_string("efb-form-setting-update-fail-msg", "local_edwiserform"),
        );
        $type = self::getarrayval($settings, "type");
        $formid = self::getarrayval($settings, "id");
        $eventsettings = self::getarrayval($settings, "eventsettings");
        $params = self::validate_parameters(self::update_form_parameters(), array("setting" => $settings, "formdef" => $formdef));
        $settings = self::getarrayval($params, 'setting');
        $formid = self::getarrayval($settings, "id");
        $formdefinition = self::getarrayval($params, 'formdef');
        $responce["formid"] = $formid;
        $formsettings = self::get_form_settings($settings);
        $status = self::update_form_status($formid, $formdefinition, $formsettings);
        if ($status == true) {
            $responce['status'] = true;
            $responce['msg'] = get_string("efb-form-setting-update-msg", "local_edwiserform");
        } else if ($status == false) {
            $responce['msg'] = get_string("efb-form-def-update-fail-msg", "local_edwiserform");
        } else {
            $responce['msg'] = $status;
        }
        return $responce;
    }

    private static function get_form_settings($setting) {
        global $DB, $USER, $CFG;
        $data = new \stdClass();
        $data->id = self::getarrayval($setting, "id");
        $data->title = self::getarrayval($setting, "title");
        $data->description = self::getarrayval($setting, "description");
        $data->type = self::getarrayval($setting, "type");
        $data->notifi_email = self::getarrayval($setting, "notifi_email");
        $data->data_edit = self::getarrayval($setting, "data_edit", false);
        $context = context_system::instance();
        require_once($CFG->libdir . "/filelib.php");
        $data->message = file_save_draft_area_files(
            self::getarrayval($setting, "draftitemid", 0),
            $context->id,
            EDWISERFORM_COMPONENT,
            EDWISERFORM_FILEAREA,
            $data->id,
            array('subdirs' => false),
            self::getarrayval($setting, "message", "")
        );
        $data->author2 = $USER->id;
        $data->modified = date('Y-m-d H:i:s');
        return $data;
    }

    private static function compare_form_definition($def1, $def2) {
        if ($def1 != $def2) {
            $def1 = json_decode_level_2($def1);
            $def2 = json_decode_level_2($def2);
            foreach ($def1["fields"] as $key => $value) {
                if (!isset($def2["fields"][$key]) || $value != $def2["fields"][$key]) {
                    return false;
                }
            }
        }
        return true;
    }


    private static function update_form_status($formid, $formdefinition, $formsettings) {
        global $DB;
        $submissions = $DB->count_records("efb_form_data", array("formid" => $formid));
        $oldform = $DB->get_field("efb_forms", "definition", array("id" => $formid));
        $overwrite = self::compare_form_definition($formdefinition, $oldform);
        $formsettings->definition = $formdefinition;
        if (!$submissions || $overwrite) {
            $DB->update_record("efb_forms", $formsettings);
            return true;
        }
        return false;
    }

    public static function update_form_returns() {
        return new \external_single_structure(
                array(
            'status' => new external_value(PARAM_BOOL, 'Form deletion status.'),
            'formid' => new external_value(PARAM_INT, 'Form id.'),
            'msg' => new external_value(PARAM_RAW, 'Form deletion message.')
                )
        );
    }

}
