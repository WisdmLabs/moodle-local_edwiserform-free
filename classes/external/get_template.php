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
 * @author yogesh shirsath
 */
trait get_template {

    public static function get_template_parameters() {
        return new external_function_parameters(
                array(
            'name' => new external_value(PARAM_TEXT, 'Template name.', VALUE_REQUIRED)
            )
        );
    }

    public static function get_template($name) {
        global $DB;
        $responce = array(
            'status'     => false,
            'definition' => '',
            'msg'        => get_string("efb-template-not-found", "local_edwiserform")
        );
        if (trim($name) == '') {
            $responce['msg'] = get_string("efb-template-name-not-valid", "local_edwiserform");
            return $responce;
        }
        $template = $DB->get_record("efb_form_templates", array("name" => $name));
        if ($template) {
            $responce['status'] = true;
            $responce['definition'] = $template->definition;
            $responce['msg'] = get_string("efb-template-found", "local_edwiserform");
        }
        return $responce;
    }

    public static function get_template_returns() {
        return new \external_single_structure(
            [
                'status'     => new external_value(PARAM_BOOL, 'Template responce status.'),
                'definition' => new external_value(PARAM_TEXT, 'Template definition'),
                'msg'        => new external_value(PARAM_TEXT, 'Template responce message')
            ]
        );
    }

}
