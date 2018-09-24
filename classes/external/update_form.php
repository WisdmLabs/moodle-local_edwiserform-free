<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace local_edwiserform\external;

use external_function_parameters;
use external_value;
use context_system;
/**
 *
 * @author sudam
 */
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
                        'courses' => new external_value(PARAM_SEQUENCE, 'Enrollment courses list this value is reqired if type is enrol', VALUE_OPTIONAL),
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
        $type = self::getArrVal($settings, "type");
        $formid = self::getArrVal($settings, "id");
        $eventsettings = self::getArrVal($settings, "eventsettings");
        if ($type != 'blank') {
            $plugin = get_plugin($type);
            $status = $plugin->verify_form_settings($eventsettings);
            if ($status != '') {
                $responce["formid"] = $formid;
                $responce['msg'] = $status;
                return $responce;
            }
        }
        $params = self::validate_parameters(self::update_form_parameters(), array("setting" => $settings, "formdef" => $formdef));
        $settings = self::getArrVal($params, 'setting');
        $formid = self::getArrVal($settings, "id");
        $formdefinition = self::getArrVal($params, 'formdef');
        $responce["formid"] = $formid;
        $formsettings = self::get_form_settings($settings);
        $status = self::update_form_status($formid, $formdefinition, $formsettings);
        if ($status == true) {
            if ($type != 'blank') {
                $plugin = get_plugin($type);
                $plugin->update_form($formid, $eventsettings);
            }
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
        $data->id = self::getArrVal($setting, "id");
        $data->title = self::getArrVal($setting, "title");
        $data->description = self::getArrVal($setting, "description");
        $data->type = self::getArrVal($setting, "type");
        $data->notifi_email = self::getArrVal($setting, "notifi_email");
        $data->courses = self::getArrVal($setting, "courses", array());
        $data->data_edit = self::getArrVal($setting, "data_edit", false);
        $context = context_system::instance();
        require_once($CFG->libdir . "/filelib.php");
        $data->message = file_save_draft_area_files(
            self::getArrVal($setting, "draftitemid", 0),
            $context->id,
            EDWISERFORM_COMPONENT,
            EDWISERFORM_FILEAREA,
            $data->id,
            array('subdirs'=>false),
            self::getArrVal($setting, "message", "")
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
                if ($value != $def2["fields"][$key]) {
                    return false;
                }
            }
        }
        return true;
    }


    private static function update_form_status($formid, $formdefinition, $formsettings) {
        global $DB;
        $submissions = $DB->count_records("efb_form_data", array("formid" => $formid));
        $oldForm = $DB->get_field("efb_forms", "definition", array("id" => $formid));
        $overwrite = self::compare_form_definition($formdefinition, $oldForm);
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
