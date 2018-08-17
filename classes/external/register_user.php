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
 * @package   local_wdm_schoolstate
 * @copyright WisdmLabs
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_edwiserform\external;

use external_function_parameters;
use external_single_structure;
use external_value;
use stdClass;
use core_user;


/**
 *
 * @author Yogesh Shirsath
 */
trait register_user
{

    public static function register_user_parameters()
    {
        return new external_function_parameters(
                [
            "formid" => new external_value(PARAM_INTEGER, "Form id", VALUE_REQUIRED),
            "data" => new external_value(PARAM_TEXT, "Data submitted by user", VALUE_REQUIRED)
                ]
        );
    }

    public static function register_user($formid, $data)
    {
        global $DB, $CFG;
        require_once($CFG->dirroot . "/local/edwiserform/classes/efb_template_actions.php");
        $status = "operation-failed";
        $responce = array(
        	"status" => true,
            "msg" =>get_string("efb-valid-form-data", "local_edwiserform"),
            "errors" => ""
        );
        $form = $DB->get_record("efb_forms", array("id" => $formid));
        $responce = self::registration_data_validation($form, $data);
        return $responce;
    }

    public static function register_user_returns()
    {
        return new external_single_structure(
                [
            "status" => new external_value(PARAM_BOOL, "Form validation status."),
            "msg"    => new external_value(PARAM_TEXT, "Form validation message."),
            "errors" => new external_value(PARAM_TEXT, "Form validation errorss")
                ]
        );
    }

    public static function get_registration_required_parameters() {
        return [
            'username',
            'firstname',
            'lastname',
            'email'
        ];
    }
    public static function get_registration_optional_parameters() {
        return [
            'password',
            'createpassword',
            'auth',
            'idnumber',
            'lang',
            'calendartype',
            'theme',
            'timezone',
            'mailformat',
            'description',
            'city',
            'country',
            'firstnamephonetic',
            'lastnamephonetic',
            'middlename',
            'alternatename'
        ];
    }

    public static function user_required_parameter_empty($user) {
        $errors = [];
        $required = self::get_registration_required_parameters();
        foreach ($required as $param) {
            if ($user->$param == '') {
                $errors[$param] = get_edwiserform_string($param."-required");
            }
        }
        return $errors;
    }

    public static function user_validation($user) {
        global $DB;
        $errors = self::user_required_parameter_empty($user);
        if (!isset($errors["username"]) && $user->username != '') {
            $userexist = $DB->count_records("user", array("username" => $user->username));
            if ($userexist) {
                $errors["username"] = get_edwiserform_string("username-duplicate");
            }
        }
        if (!get_config("core", "allowaccountssameemail")) {
            $sql = "SELECT * FROM {user} WHERE email = ? and deleted = 0";
            $userexist = $DB->get_records_sql($sql, array($user->email));
            if ($userexist) {
                $errors["email"] = get_edwiserform_string("email-duplicate");
            }
        }
        if (property_exists($user, "email2") && $user->email != $user->email2) {
            $errors["email2"] = get_edwiserform_string("email-not-match");
        }
        return count($errors) ? $errors : true;
    }

    public static function registration_data_validation($form, $data) {
        global $CFG;
        $responce = array(
            "status" => false,
            "msg" => $form->message ? $form->message : get_string("efb-valid-form-data", "local_edwiserform"),
            "errors" => ""
        );
        $required = self::get_registration_required_parameters();
        $optional = self::get_registration_optional_parameters();
        $other = array("email2");
        $user = new stdClass;
        $data = json_decode($data, true);
        foreach ($data as $input) {
            $name = $input["name"];
            $value = $input["value"];
            if (in_array($name, $required)) {
                $index = array_search($name, $required);
                unset($required[$index]);
                $user->$name = $value;
            } else if (in_array($name, $optional)) {
                $index = array_search($name, $optional);
                unset($optional[$index]);
                $user->$name = $value;
            } else if (in_array($name, $other)) {
                $index = array_search($name, $other);
                unset($other[$index]);
                $user->$name = $value;
            }
        }
        if (count($required) > 0) {
            $msg = '';
            foreach ($required as $param) {
                $msg .= $param . ", ";
            }

            $msg = substr($msg, 0, count($msg) - 2);
            $msg .= ' is required. Please contact administrator to modify form.';
            $responce['msg'] = $msg;
        } else {
            require_once($CFG->dirroot . '/user/lib.php');
            try {
                $errors = self::user_validation($user);
                if ($errors !== true) {
                    $responce["errors"] = json_encode($errors);
                    $responce["msg"] = "Unable to register.";
                } else {
                    if (!property_exists($user, "password")) {
                        $user->password = generate_password();
                    }
                    $messagehtml = "<p>Username: " . $user->username . "</p>";
                    $messagehtml .= "<p>Password: " . $user->password . "</p>";
                    $user->mnethostid = $CFG->mnet_localhost_id;
                    $user->password = md5($user->password);
                    $userid = user_create_user($user, false, false);
                    if ($userid) {
                        send_email(get_config("core", "smtpuser"), $user->email, "Registration", $messagehtml);
                        $responce["status"] = true;
                    } else {
                        $responce["msg"] = "Unable to register.";
                    }
                }
            } catch (exception $ex) {

            }

        }
        return $responce;
    }
}
