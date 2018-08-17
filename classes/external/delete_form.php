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
trait delete_form
{

    public static function delete_form_parameters()
    {
        return new external_function_parameters(
                [
            'id' => new external_value(PARAM_INT, 'Form id', VALUE_REQUIRED),
                ]
        );
    }

    public static function delete_form($formid)
    {
        global $DB;
        $response = array("status" => false, "msg" => get_string("efb-msg-form-delete-fail", "local_edwiserform"));
        if (!$formid) {
            return $response;
        }
        $data          = new \stdClass();
        $data->id      = $formid;
        $data->deleted = true;
        $status        = $DB->update_record("efb_forms", $data);
        if ($status) {
            $msg = get_string("efb-msg-form-delete-success", "local_edwiserform");
        }
        return array("status" => $status, "msg" => $msg);
    }

    public static function delete_form_returns()
    {
        return new \external_single_structure(
                [
            'status' => new external_value(PARAM_BOOL, 'Form deletion status.'),
            'msg'    => new external_value(PARAM_TEXT, 'Form deletion message.')
                ]
        );
    }
}
