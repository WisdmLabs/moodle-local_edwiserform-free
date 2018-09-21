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
 * @author    Yogesh Shirsath
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
require_once('../../../../config.php');
require_once($CFG->dirroot . "/local/edwiserform/lib.php");
require_once($CFG->dirroot . "/local/edwiserform/classes/renderables/efb_list_form_data.php");

function get_total_ebf_form_data_records($searchFlag, $searchText)
{
    global $DB, $USER;
    $stmt = "SELECT * FROM {efb_form_data} ";
    if ($searchFlag) {
        $stmt = "SELECT * FROM {efb_form_data} WHERE JSON_EXTRACT(submission, '$[*].value') REGEXP '" . $searchText . "'";
    }
    $param = [];
    $records = $DB->get_records_sql($stmt, $param);
    return count($records);
}
if (isset($_REQUEST['iDisplayStart']) && $_REQUEST['iDisplayLength'] != '-1') {
    $wdmLimit = 'LIMIT '.intval($_REQUEST['iDisplayStart']).', '.
            intval($_REQUEST['iDisplayLength']);
}
$searchText = "";
$searchFlag = 0;
if (isset($_REQUEST['sSearch']) && !empty($_REQUEST['sSearch'])) {
    $searchText = $_REQUEST['sSearch'];
    $searchFlag = 1;
}

$sortColumn = 0;
$sortDir = "";
if (isset($_REQUEST['iSortCol_0'])) {
    if ($_REQUEST['iSortCol_0'] == 0 && $_REQUEST['sSortDir_0'] === 'desc') {
        $sortColumn = 0;
        $sortDir = "desc";
    } else {
        $sortColumn = $_REQUEST['iSortCol_0'];
        $sortDir = $_REQUEST['sSortDir_0'];
    }
}
$formid = required_param('formid', PARAM_INT);
$object = new \efb_list_form_data($formid);
$rows = $object->get_submissions_list($wdmLimit, $searchText);
$data = array(
            'sEcho' => intval($_REQUEST['sEcho']),
            'iTotalRecords' => count($rows),
            'iTotalDisplayRecords' => get_total_ebf_form_data_records($searchFlag, $searchText),
        );
$data["data"] = $rows;
echo json_encode($data);
die();
