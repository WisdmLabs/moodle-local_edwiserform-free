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
 * Plugin version and other meta-data are defined here.
 *
 * @package     edwiserformevent_contactus
 * @copyright   2018 WisdmLabs <support@wisdmlabs.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @author      Yogesh Shirsath
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/local/edwiserform/events/events.php');

class edwiserform_events_contactus extends edwiserform_events_plugin {

	/**
     * Execute event action after form submission
     * @param object form
     * @param object data - submitted by user
     * @return object with attached event data
     */
    public function attach_data($form, $data) {
    	global $USER;
        if ($USER->id == 0) {
            return $data;
        }
        $user = array(
            "firstname" => $USER->firstname,
            "lastname" => $USER->lastname,
            "name" => $USER->firstname . " " . $USER->lastname,
            "email" => $USER->email,
            "mobile" => $USER->phone1,
            "phone" => $USER->phone1,
            "phone2" => $USER->phone2
        );
        $userfields = array_keys($user);
        if ($data == '') {
            $data = [];
            foreach ($user as $key => $value) {
                $data[] = array("name" => $key, "value" => $value, "readonly" => true);
            }
            $data = json_encode($data);
            return $data;
        }
        $data = json_decode($data, true);
        foreach ($data as $entry) {
            $name = $entry["name"];
            if (in_array($name, array_keys($user))) {
                $entry["readonly"] = true;
            }
        }
        $data = json_encode($data);
        return $data;
    }
}
