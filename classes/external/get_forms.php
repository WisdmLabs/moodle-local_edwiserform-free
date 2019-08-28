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
 * Datatable ajax service for getting form records
 * @package   local_edwiserform
 * @copyright WisdmLabs 2018
 * @author    Yogesh Shirsath
 * @author    Krunal Kamble
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../../../config.php');
require_once($CFG->dirroot . "/local/edwiserform/lib.php");
require_once($CFG->dirroot . "/local/edwiserform/classes/renderables/efb_list_form.php");

/**
 * Returns total number of form created by admin/teacher with search filter criteria
 * @param  boolean $searchflag true if user is filtering data
 * @param  string  $searchtext query string to search in the data
 * @return integer count forms created
 * @since  Edwiser Form 1.0.0
 */
function get_total_ebf_forms_records($searchflag, $searchtext) {
    global $DB, $USER;
    $stmt = "SELECT * FROM {efb_forms} WHERE deleted = 0 ";
    if ($searchflag) {
        $stmt = "SELECT * FROM {efb_forms} WHERE (title REGEXP '" . $searchtext . "' OR  type REGEXP '" . $searchtext."') and deleted = 0";
    }
    $param = [];
    if (!is_siteadmin()) {
        $stmt .= " and author=?";
        $param[] = can_create_or_view_form() ? $USER->id : 0;
    }
    $records = $DB->get_records_sql($stmt, $param);
    return count($records);
}
$wdmlimit = array(
    'from' => 0,
    'to' => 0
);
// Checking for limit to paginate data
if (isset($_REQUEST['iDisplayStart']) && $_REQUEST['iDisplayLength'] != '-1') {
    $wdmlimit = array(
        'from' => intval($_REQUEST['iDisplayStart']),
        'to' => intval($_REQUEST['iDisplayLength'])
    );
}

$searchtext = "";
$searchflag = 0;

// Check for search query and setting search flag
if (isset($_REQUEST['sSearch']) && !empty($_REQUEST['sSearch'])) {
    $searchtext = $_REQUEST['sSearch'];
    $searchflag = 1;
}

// Check for column with sorting flag
$sortcolumn = 0;
$sortdir = "";
if (isset($_REQUEST['iSortCol_0'])) {
    if ($_REQUEST['iSortCol_0'] == 0 && $_REQUEST['sSortDir_0'] === 'desc') {
        $sortcolumn = 0;
        $sortdir = "desc";
    } else {
        $sortcolumn = $_REQUEST['iSortCol_0'];
        $sortdir = $_REQUEST['sSortDir_0'];
    }
}
$object = new \efb_list_form();
$rows = $object->get_forms_list($wdmlimit, $searchtext, $sortcolumn, $sortdir);
$data = array(
            'sEcho' => intval($_REQUEST['sEcho']),
            'iTotalRecords' => count($rows),
            'iTotalDisplayRecords' => get_total_ebf_forms_records($searchflag, $searchtext),
        );
$data["data"] = $rows;
echo json_encode($data);
die();
