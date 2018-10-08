<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace local_edwiserform\external;

use external_function_parameters;
use external_value;
use stdClass;
use context_system;

/**
 *
 * @author sudam
 */
trait create_new_form {

    public static function create_new_form_parameters() {
        return new external_function_parameters(array(
                "setting" => new \external_single_structure(
                    array(
                        'title' => new external_value(PARAM_TEXT, 'Form title', VALUE_REQUIRED),
                        'description' => new external_value(PARAM_TEXT, 'Form description.', VALUE_OPTIONAL),
                        'data_edit' => new external_value(PARAM_BOOL, 'Is form editable. Boolean true/flase', VALUE_REQUIRED),
                        'type' => new external_value(PARAM_TEXT, 'Type of the form', VALUE_REQUIRED),
                        'notifi_email' => new external_value(PARAM_TEXT, 'Notification email address. This value is required if the form type is contact us', VALUE_OPTIONAL),
                        'message' => new external_value(PARAM_RAW, 'Message to show after successfull submission', VALUE_OPTIONAL),
                        "draftitemid" => new external_value(PARAM_INT, 'Draft item id form message', VALUE_OPTIONAL),
                        'courses' => new external_value(PARAM_SEQUENCE, 'Enrollment courses list this value is reqired if type is enrol', VALUE_OPTIONAL),
                        'eventsettings' => new external_value(PARAM_RAW, 'Event settings', VALUE_OPTIONAL)
                    )
                ),
                'formdef' => new external_value(PARAM_RAW, 'Form signuture in json format.', VALUE_REQUIRED),
            )
        );
    }

    public static function create_new_form($settings, $formdef) {
        $responce = array(
            'status' => false,
            'msg' => get_string("efb-form-setting-save-fail-msg", "local_edwiserform"),
            'formid' => 0
        );
        $type = self::getArrVal($settings, "type");
        $eventsettings = self::getArrVal($settings, "eventsettings");
        $params = self::validate_parameters(self::create_new_form_parameters(), array("setting" => $settings, "formdef" => $formdef));
        $formid = self::save_form($params['setting'], $params['formdef']);
        if ($formid > 0) {
            if ($type != 'blank') {
                $plugin = get_plugin($type);
                $plugin->create_new_form($formid, $eventsettings);
            }
            $responce['status'] = true;
            $responce['msg'] = get_string("efb-form-setting-save-msg", "local_edwiserform");
            $responce['formid'] = $formid;
        }
        return $responce;
    }

    private static function save_form($setting, $definition) {
        global $DB, $USER, $CFG;
        $data = new \stdClass();
        $data->title = self::getArrVal($setting, "title");
        $data->description = self::getArrVal($setting, "description");
        $data->author = $USER->id;
        $data->type = self::getArrVal($setting, "type");
        $data->notifi_email = self::getArrVal($setting, "notifi_email");
        $data->courses = self::getArrVal($setting, "courses", array());
        $data->message = self::getArrVal($setting, "message", "");
        $data->data_edit = self::getArrVal($setting, "data_edit");
        $data->definition = $definition;
        $data->enabled = 0;
        $data->deleted = 0;
        try {
            $result = $DB->insert_record("efb_forms", $data, $returnid = true, $bulk = false);
            $form = new stdClass;
            $form->id = $result;
            $context = context_system::instance();
            require_once($CFG->libdir . "/filelib.php");
            $form->message = file_save_draft_area_files(
                self::getArrVal($setting, "draftitemid", 0),
                $context->id,
                EDWISERFORM_COMPONENT,
                EDWISERFORM_FILEAREA,
                $result,
                array('subdirs'=>false),
                self::getArrVal($setting, "message", "")
            );
            $DB->update_record("efb_forms", $form);
        } catch (\Exception $ex) {
            $result = $ex->getMessage();
        }
        return $result;
    }

    public static function create_new_form_returns() {
        return new \external_single_structure(
                array(
            'status' => new external_value(PARAM_BOOL, 'Form deletion status.'),
            'formid' => new external_value(PARAM_INT, 'Form id.'),
            'msg' => new external_value(PARAM_RAW, 'Form deletion message.')
                )
        );
    }

    public static function getArrVal($array, $key, $value = "") {
        if (isset($array[$key]) && !empty($array[$key])) {
            $value = $array[$key];
        }
        return $value;
    }

}
