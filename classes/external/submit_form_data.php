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
use context_system;

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
        $form = $DB->get_record('efb_forms', array('id' => $formid));
        if (!$form) {
            return $responce;
        }
        $plugin = null;
        if ($form->type != 'blank') {
            $plugin = get_plugin($form->type);
        }
        if (isloggedin()) {
            $userid = $USER->id;
        } else {
            $userid = 0;
        }
        $submission = $DB->get_record("efb_form_data", array('formid' => $formid, 'userid' => $userid));
        if (self::should_update_submission($form, $submission, $plugin)) {
            $submission->submission = $data;
            $submission->updated = date('Y-m-d H:i:s');
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
            $responce['msg'] = "<p>" . get_string("efb-form-data-submission-successful", "local_edwiserform") . "</p>";
            $eventmail = '';
            if ($form->type != 'blank') {
                $eventmail = $plugin->submission_email_message($form, $submission);
            }
            $responce['msg'] .= self::notify($form, $data, $eventmail);
            if ($form->message) {
                $responce['msg'] .= self::confirmation($form, $submission->submission);
            }
        }
        return $responce;
    }

    public static function should_update_submission($form, $submission, $plugin) {
        if (!$submission) {
            return false;
        }
        if ($form->type == 'blank') {
            return true;
        }
        if ($plugin->support_multiple_submissions()) {
            return false;
        }
        if ($plugin->support_form_data_update()) {
            return true;
        }
        return false;
    }
    public static function confirmation($form, $submission) {
        global $USER;
        $email = "";
        if ($USER->id != 0 && !empty($USER->email)) {
            $email = $USER->email;
        }
        if (!$email) {
            return get_string('efb-confirmation-email-failed', 'local_edwiserform');
        }
        $submission = json_decode($submission);
        $context = context_system::instance();
        $messagehtml = file_rewrite_pluginfile_urls($form->message, 'pluginfile.php', $context->id, EDWISERFORM_COMPONENT, EDWISERFORM_FILEAREA, $form->id);
        if (edwiserform_send_email(get_config("core", "smtpuser"), $email, get_string('efb-form-data-submission-successful', 'local_edwiserform'), $messagehtml)) {
            return get_string('efb-confirmation-email-success', 'local_edwiserform');
        }
        return get_string('efb-confirmation-email-failed', 'local_edwiserform');
    }

    public static function notify($form, $submission, $eventmail = '') {
        global $CFG, $COURSE, $USER;
        $submission = json_decode($submission);
        $subject = get_string('efb-notify-email-subject', 'local_edwiserform', array('site' => $COURSE->fullname, 'title' => $form->title));
        $user = $USER->id != 0 ? "$USER->firstname $USER->lastname" : get_string('efb-submission-anonymous-user', 'local_edwiserform');
        $title = $form->title;
        $link = $CFG->wwwroot . "/local/edwiserform/view.php?page=viewdata&formid=" .$form->id;
        $messagehtml = get_string('efb-notify-email-body', 'local_edwiserform', array('user' => $user, 'title' => $form->title, 'link' => $link));
        $messagehtml .= $eventmail;
        if ($form->notifi_email) {
            $emails = explode(',', $form->notifi_email);
            $status = true;
            foreach ($emails as $email) {
                $status = $status && edwiserform_send_email(get_config("core", "smtpuser"), $email, $subject, $messagehtml);
            }
            if ($status != true) {
                return get_string('efb-notify-email-failed', 'local_edwiserform');
            }
            return get_string('efb-notify-email-success', 'local_edwiserform');
        }
        return '';
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
