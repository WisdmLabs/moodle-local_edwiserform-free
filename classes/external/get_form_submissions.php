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
 * @package local_edwiserform
 * @author  2019 WisdmLabs
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_edwiserform\external;

use stdClass;
use external_function_parameters;
use external_value;
use external_single_structure;
use external_multiple_structure;
use context_system;
use html_writer;
use local_edwiserform\output\list_form_data;

trait get_form_submissions {

    /*
     * Returns description of method parameters
     * @return external_function_parameters
     */
    public static function get_form_submissions_parameters() {
        // get_form_submissions_parameters() always return an external_function_parameters().
        // The external_function_parameters constructor expects an array of external_description.
        return new external_function_parameters(
            // a external_description can be: external_value, external_single_structure or external_multiple structure
            array(
                'formid'   => new external_value(PARAM_INT, 'Form id'),
                'search'   => new external_value(PARAM_RAW, 'Search query'),
                'start'    => new external_value(PARAM_INT, 'Start index of record'),
                'length'   => new external_value(PARAM_INT, 'Number of records per page'),
            )
        );
    }



    /**
     * The function itself
     * @return string welcome message
     */
    public static function get_form_submissions($formid, $search, $start = 0, $length = 0) {
        global $PAGE;
        $PAGE->set_context(context_system::instance());

        $limit = array(
            'from' => $start,
            'to' => $length
        );

        $listformdata = new list_form_data($formid);

        $rows = $listformdata->get_submissions_list($limit, $search);
        $count = $listformdata->get_submission_count($formid, $search);

        return array(
            "data" => empty($rows) ? [] : $rows,
            "recordsTotal" => $count,
            "recordsFiltered" => $count
        );
    }
    /**
     * Returns description of method result value
     * @return external_description
     */
    public static function get_form_submissions_returns() {
        return new external_single_structure(
            array(
                "data" => new external_multiple_structure(
                    new external_multiple_structure(
                        new external_value(PARAM_RAW, "Row data"),
                        'Form details',
                        VALUE_DEFAULT,
                        ''
                    ),
                    'Form submission list',
                    VALUE_DEFAULT,
                    []
                ),
                "recordsTotal" => new external_value(PARAM_INT, "Total records found"),
                "recordsFiltered" => new external_value(PARAM_INT, "Total filtered record")
            )
        );
    }
}
