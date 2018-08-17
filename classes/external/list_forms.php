<?php
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
namespace local_edwiserform\external;
use external_function_parameters;
use external_value;

/**
 *
 * @author sudam
 */
trait list_forms
{

    public static function get_form_list_parameters()
    {
        return new external_function_parameters(
                array(
            'type' => new external_value(PARAM_TEXT, 'Form type', VALUE_REQUIRED),
                )
        );
    }

    public static function get_form_list($type)
    {
        global $DB, $USER;
        $responce   = array(
            "status" => true,
            "data"   => array()
        );
        $conditiaon = array("type" => $type);
        if (!is_siteadmin()) {
            $conditiaon["author"] = $USER->id;
        }
        $records = $DB->get_records("efb_forms", array("type" => $type));
        foreach ($records as $rec) {
            $data[] = array(
                "id"             => $rec->id,
                "title"          => $rec->title,
                "author"         => $rec->author,
                "created"        => $rec->created,
                "data_edit"      => $rec->data_edit,
                "type"           => $rec->type,
                "notifi_email"   => $rec->notifi_email,
                "courses"        => self::get_courses_list($rec->courses),
                "status"         => $rec->status,
                "allow_updation" => $rec->author == $USER->id ? 1 : 0,
            );
        }
        if ($status) {
            $msg = get_string("efb-msg-form-delete-success", "local_edwiserform");
        }
        return $responce;
    }

    private static function get_courses_list($coursesids)
    {
        global $DB;
        $courses    = array();

        $query      = "SELECT id, fullname, shortname from {course} where id in($coursesids)";
        $courselist = $DB->get_records_sql($query);
        foreach ($courselist as $course) {
            $courses[$course->id] = $course->fullname;
        }
        $courseslist= \html_writer::alist($courses);
        return $courseslist;
    }

    public static function get_form_list_returns()
    {
        return new \external_multiple_structure(
                new \external_single_structure(
                array(
            "id"             => new \external_value(PARAM_INTEGER, "Form id"),
            "title"          => new \external_value(PARAM_TEXT, "Form title"),
            "author"         => new \external_value(PARAM_TEXT, "Form author name"),
            "created"        => new \external_value(PARAM_TEXT, "Form creation date"),
            "data_edit"      => new \external_value(PARAM_TEXT, "Form last update date"),
            "type"           => new \external_value(PARAM_TEXT, "Type of the form"),
            "notifi_email"   => new \external_value(PARAM_EMAIL, "Notification email address"),
            "courses"        => new \external_value(PARAM_RAW, "List of the assocaited courses"),
            "status"         => new \external_value(PARAM_TEXT, "Form deletion status"),
            "allow_updation" => new \external_value(PARAM_BOOL, "Allow form edit"),
                )
                )
        );
    }
}
