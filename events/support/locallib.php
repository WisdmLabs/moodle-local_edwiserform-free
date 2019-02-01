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
 * @package     edwiserformevents_support
 * @copyright   2018 WisdmLabs <support@wisdmlabs.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @author      Yogesh Shirsath
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/local/edwiserform/events/events.php');

class edwiserform_events_support extends edwiserform_events_plugin {

    public function submission_email_message($form, $submission) {
        return $this->common_submission_email_message($form, $submission);
    }
    /**
     * Execute event action after form submission
     * @param object form
     * @param object data - submitted by user
     * @return object with attached event data
     */
    public function attach_data($form, $data) {
        return $this->attach_common_data($form, $data);
    }

    /**
     * Returns does plugin support multiple submissions for single user
     *
     * @return bool
     * @since  Edwiser Form 1.2
     */
    public function support_multiple_submissions() {
        return true;
    }
}
