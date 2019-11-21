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

use external_single_structure;
use external_function_parameters;
use external_value;
use context_system;
use stdClass;

trait submit_form_data {

    /**
     * Describes the parameters for submit for data
     * @return external_function_parameters
     * @since  Edwiser Forms 1.0.0
     */
    public static function submit_form_data_parameters() {
        return new external_function_parameters(
            array(
                'formid' => new external_value(PARAM_TEXT, 'Form id', VALUE_REQUIRED),
                'data' => new external_value(PARAM_TEXT, 'Form data submited by user.', VALUE_REQUIRED),
            )
        );
    }

    /**
     * Save usr's submitted form data, process events, send confirmation and notification email
     * @param  integer $formid The form id
     * @param  string  $data json string of user's submission data
     * @param  array   [status, msg, errors(encodded errors array)]
     * @since  Edwiser Form 1.0.0
     */
    public static function submit_form_data($formid, $data) {
        global $DB, $USER, $CFG;
        $responce = array(
            'status' => false,
            'msg' => get_string("form-data-submission-failed", "local_edwiserform"),
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
        if (self::should_update_submission($form, $data, $plugin)) {
            $submission = $DB->get_record("efb_form_data", array('formid' => $formid, 'userid' => $userid));
            $submission->submission = $data;
            $submission->updated = time();
            $status = $DB->update_record("efb_form_data", $submission);
        } else {
            $submission = new stdClass;
            $submission->formid = $formid;
            $submission->userid = $USER->id;
            $submission->submission = $data;
            $submission->date = time();
            $status = $DB->insert_record("efb_form_data", $submission);
        }
        if ($status) {
            $responce['status'] = true;
            $responce['msg'] = "<p>" . get_string("form-data-submission-successful", "local_edwiserform", $CFG->wwwroot . '/?redirect=0') . "</p>";
            if ($form->message) {
                $responce['msg'] .= self::confirmation($form, $data);
            }
            $responce['msg'] .= self::notify($form);
        }
        return $responce;
    }

    /**
     * Check whether form can update form data
     * @param  Object  $form       form object
     * @param  Array   $submission previous submission
     * @param  Object  $plugin     plugin object
     * @return Boolean             true if update possible
     */
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

    /**
     * Get value from submission using field name
     * @param  array  $submission Submitted data
     * @param  string $name       Name of field
     * @return string             Value of submitted field
     * @since  Edwiser Form 1.0.0
     */
    public static function submission_get_value_from_name($submission, $name) {
        foreach ($submission as $input) {
            if ($input->name == $name) {
                return $input->value;
            }
        }
        return "";
    }

    /**
     * Get email from form definition and submission
     * @param  array  $definition Form definition
     * @param  array  $submission Data submitted in the form
     * @return string             Email id if present in form and submission else blank
     * @since  Edwiser Form 1.0.5
     */
    public static function email_from_form($definition, $submission) {
        $submission = json_decode($submission);
        $definition = json_decode($definition, true);
        if (empty($submission) || empty($definition)) {
            return false;
        }
        $fields = $definition['fields'];
        foreach ($fields as $field) {
            if ($field['tag'] = 'input' &&
                isset($field['attrs']['type']) &&
                isset($field['attrs']['name']) &&
                $field['attrs']['type'] == 'email'
            ) {
                if ($value = self::submission_get_value_from_name($submission, $field['attrs']['name'])) {
                    return $value;
                }
            }
        }
        return "";
    }

    /**
     * Sending confirmation email to user who submitted form
     * @param  stdClass $form       The form object with definition and settings
     * @param  array    $submission Data submitted by user through form
     * @return string               success message when email sent succussful or failed message
     * @since  Edwiser Form 1.0.0
     */
    public static function confirmation($form, $submission) {
        global $USER, $CFG;
        $email = self::email_from_form($form->definition, $submission);
        if ($email == '' && $USER->id != 0 && !empty($USER->email)) {
            $email = $USER->email;
        }
        if (!$email) {
            return get_string('confirmation-email-failed', 'local_edwiserform');
        }
        $context = context_system::instance();
        $messagehtml = file_rewrite_pluginfile_urls($form->message, 'pluginfile.php', $context->id, EDWISERFORM_COMPONENT, EDWISERFORM_FILEAREA, $form->id);
        if (edwiserform_send_email(
            get_config("core", "smtpuser"),
            $email,
            get_string('confirmation-default-subject', 'local_edwiserform'),
            $messagehtml
        )) {
            return get_string('confirmation-email-success', 'local_edwiserform');
        }
        return get_string('confirmation-email-failed', 'local_edwiserform');
    }

    /**
     * Sending notification email to admin/emails from form settings
     * @param  stdClass $form       The form object with definition and settings
     * @param  array    $submission Data submitted by user through form
     * @param  string   $eventmail  Email content from email
     * @return string               success message when email sent succussful or failed message or empty if no email found
     * @since  Edwiser Form 1.0.0
     */
    public static function notify($form) {
        global $CFG, $COURSE, $USER, $DB;
        $subject = get_string('notify-email-subject', 'local_edwiserform', array('site' => $COURSE->fullname, 'title' => $form->title));
        $user = $USER->id != 0 ? "$USER->firstname $USER->lastname" : get_string('submission-anonymous-user', 'local_edwiserform');
        $title = $form->title;
        $link = $CFG->wwwroot . "/local/edwiserform/view.php?page=viewdata&formid=" .$form->id;
        $messagehtml = get_string('notify-email-body', 'local_edwiserform', array('user' => $user, 'title' => $form->title, 'link' => $link));
        if ($form->notifi_email) {
            $emails = explode(',', $form->notifi_email);
        } else {
            $emails = [$DB->get_field('user', 'email', array('id' => $form->author))];
        }
        $status = true;
        foreach ($emails as $email) {
            $status = $status && edwiserform_send_email(get_config("core", "smtpuser"), $email, $subject, $messagehtml);
        }
        if ($status != true) {
            return get_string('notify-email-failed', 'local_edwiserform');
        }
        return get_string('notify-email-success', 'local_edwiserform');
    }

    /**
     * Returns description of method parameters for submit form data
     * @return external_single_structure
     * @since  Edwiser Form 1.0.0
     */
    public static function submit_form_data_returns() {
        return new external_single_structure(
            array(
                'status' => new external_value(PARAM_BOOL, 'Form data submission status.'),
                'msg' => new external_value(PARAM_RAW, 'Form data submission message'),
                'errors' => new external_value(PARAM_RAW, 'Error array found in form submission')
            )
        );
    }

}
