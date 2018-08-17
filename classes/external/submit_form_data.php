<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace local_edwiserform\external;

use external_function_parameters;
use external_value;

/**
 *
 * @author Yogesh Shirsath
 */
trait submit_form_data {

    public static function submit_form_data_parameters() {
        return new external_function_parameters(
            array(
                'formid' => new external_value(PARAM_TEXT, 'Form id', VALUE_REQUIRED),
                'data' => new external_value(PARAM_TEXT, 'Form data submited by user.', VALUE_REQUIRED),
            )
        );
    }

    public static function submit_form_data($formid, $data) {
        global $DB, $USER, $CFG;
        $responce = array(
            'status' => false,
            'msg' => get_string("efb-form-data-submission-failed", "local_edwiserform"),
            'errors' => "{}"
        );
        if (!$formid) {
            return $responce;
        }
        $form = $DB->get_record('efb_forms', array('id' => $formid));
        $plugin = null;
        $submissionsupports = true;
        if ($form->type != 'blank') {
            $plugin = get_plugin($form->type);
            $submissionsupports = $plugin->can_save_data();
        }
        if (!$submissionsupports) {
            return array(
                'status' => false,
                'msg' => get_string("efb-form-data-submission-not-supported", "local_edwiserform")
            );
        }
        if (isloggedin()) {
            $userid = $USER->id;
        } else {
            $userid = 0;
        }
        if ($form->type != 'blank') {
            $errors = $plugin->validate_form_data($form, $data);
            if (!empty($errors)) {
                return [
                    'status' => false,
                    'msg' => get_string('efb-invalid-form-data', 'local_edwiserform'),
                    'errors' => $errors
                ];
            }
        }
        if ($form->type != 'blank') {
            $pluginresponce = $plugin->event_action($form, $data);
            if ($pluginresponce->status === false) {
                return $pluginresponce;
            }
            if (isset($pluginresponce['userid'])) {
                $userid = $pluginresponce['userid'];
            }
        }
        $submission = $DB->get_record("efb_form_data", array('formid' => $formid, 'userid' => $userid));
        if ($submission && ($form->type != 'blank' && $plugin->support_form_update())) {
            $submission->submission = $data;
            $status = $DB->update_record("efb_form_data", $submission);
        } else {
            $submission = new \stdClass;
            $submission->formid = $formid;
            $submission->userid = $userid;
            $submission->submission = $data;
            $status = $DB->insert_record("efb_form_data", $submission);
        }
        if ($status) {
            $responce['status'] = true;
            $responce['msg'] = $form->message ? $form->message : get_string("efb-form-data-submission-successful", "local_edwiserform");
            $responce['msg'] = '<p>' . $responce['msg'] . '</p>';
        }
        $responce['msg'] .= self::notify($form, $data);
        return $responce;
    }

    public static function notify($form, $submission) {
        global $CFG;
        $submission = json_decode($submission);
        $subject = $form->title . " submission";
        foreach ($submission as $data) {
            $messagehtml .= "<p><b>".$data->name . ": </b>" . $data->value . "</p>";
        }
        if ($form && $form->notifi_email) {
            $emails = explode(',',$form->notifi_email);
            $status = true;
            foreach ($emails as $email) {
                $status = $status && send_email(get_config("core", "smtpuser"), $email, $subject, $messagehtml);
            }
            if ($status == true) {
                return '';
            }
        }
        return "<p>Unable to send email</p>";
    }

    public static function submit_form_data_returns() {
        return new \external_single_structure(
            array(
                'status' => new external_value(PARAM_BOOL, 'Form data submission status.'),
                'msg' => new external_value(PARAM_RAW, 'Form data submission message'),
                'errors' => new external_value(PARAM_RAW, 'Error array found in form submission')
            )
        );
    }

}
