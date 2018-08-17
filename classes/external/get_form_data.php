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
trait get_form_data
{

    public static function get_form_data_parameters()
    {
        return new external_function_parameters(
                [
            'id' => new external_value(PARAM_INTEGER, 'Form id', VALUE_DEFAULT,0),
                ]
        );
    }

    public static function get_form_data($formid=0)
    {
        global $DB;
        $responce=array("status"=>false,"data"=>"");
        $stmt="select * from {efb_form_data} where formid='$formid'";
        $result=$DB->get_record($stmt);
        $responce['data']=$result;
        return $responce;
    }

    public static function get_form_data_returns()
    {
        return new \external_single_structure(
                [
            'status' => new external_value(PARAM_BOOL, 'Form deletion status.'),
            'data'    => new external_value(PARAM_TEXT, 'Form deletion message.')
                ]
        );
    }
}
