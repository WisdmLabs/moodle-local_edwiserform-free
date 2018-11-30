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
 * Datatable ajax service for getting form submission records
 * @package   local_edwiserform
 * @copyright WisdmLabs 2018
 * @author    Yogesh Shirsath
 * @author    Krunal Kamble
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../../../config.php');
require_once($CFG->dirroot . "/local/edwiserform/lib.php");
require_once($CFG->dirroot . "/local/edwiserform/classes/renderables/efb_list_form_data.php");


/**
 * Returns total number of form data submitted by user in the XYZ form with search criteria
 * @param  boolean $searchflag true if user is filtering data
 * @param  string  $searchtext query string to search in the data
 * @param  integet $formid The id of form
 * @return integer count submission made in the form with filter result
 * @since  Edwiser Form 1.0.0
 */
function get_total_ebf_form_data_records($searchflag, $searchtext, $formid) {
    global $DB, $USER;
    $stmt = "SELECT * FROM {efb_form_data} WHERE formid = ?";
    if ($searchflag) {
        $stmt = "SELECT * FROM {efb_form_data} WHERE formid = ? AND JSON_EXTRACT(submission, '$[*].value') REGEXP '" . $searchtext . "'";
    }
    $param = [$formid];
    $records = $DB->get_records_sql($stmt, $param);
    return count($records);
}

// Checking for limit to paginate data
if (isset($_REQUEST['iDisplayStart']) && $_REQUEST['iDisplayLength'] != '-1') {
    $wdmlimit = 'LIMIT '.intval($_REQUEST['iDisplayStart']).', '.
            intval($_REQUEST['iDisplayLength']);
}
$searchtext = "";
$searchflag = 0;

// Check for search query and setting search flag
if (isset($_REQUEST['sSearch']) && !empty($_REQUEST['sSearch'])) {
    $searchtext = $_REQUEST['sSearch'];
    $searchflag = 1;
}

$formid = required_param('formid', PARAM_INT);
$object = new \efb_list_form_data($formid);
$rows = $object->get_submissions_list($wdmlimit, $searchtext);
$data = array(
            'sEcho' => intval($_REQUEST['sEcho']),
            'iTotalRecords' => count($rows),
            'iTotalDisplayRecords' => get_total_ebf_form_data_records($searchflag, $searchtext, $formid),
        );
$data["data"] = $rows;
echo json_encode($data);
die();
