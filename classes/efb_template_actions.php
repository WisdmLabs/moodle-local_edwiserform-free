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
 * @copyright WisdmLabs
 * @author Yogesh Shirsath
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


class efb_template_actions {
	public static function contact($form, $submission) {
		global $CFG;
		$submission = json_decode($submission);
		$subject = $form->title . " submission";
		foreach ($submission as $data) {
			$messagehtml .= "<p><b>".$data->name . ": </b>" . $data->value . "</p>";
		}
		if ($form && $form->notifi_email) {
			require_once($CFG->dirroot . "/local/edwiserform/lib.php");
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
	public static function enrolment($form, $userid = null, $action = 'enrol') {
		global $DB, $USER;
		if ($userid == null) {
			$userid = $USER->id;
		}
		$enrol = [];
		$enrolplugin = enrol_get_plugin('manual');
		$status = true;
		if (!in_array($action, array('enrol', 'unenrol'))) {
			return '<p>Unable to perform action</p>';
		}
		$action .= '_user';
		$courses = explode(',', $form->courses);
		foreach ($courses as $key => $course) {
			$course = trim($course);
			$instances = enrol_get_instances($course, true);
			foreach ($instances as $instance) {
	            if ($instance->enrol === 'manual') {
	                break;
	            }
	        }
			$role = $DB->get_record('role', array('shortname' => 'student'), '*', MUST_EXIST);
			$enrolplugin->$action($instance, $userid, $role->id);
		}
		return '';
	}
}
