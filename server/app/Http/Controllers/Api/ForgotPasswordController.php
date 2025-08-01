<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpStringsEmail;
use App\Models\OTP;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Password;
use App\Models\Suffix;
use Illuminate\Support\Str;
use Exception;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class ForgotPasswordController extends Controller
{    
    public function createotp(Request $request) {
        try {
            $validator = Validator::make($request->all(), [ 
                'username' => 'required',  
            ]);
            if($validator->fails()) {
                return response()->json([
                    'message' => $validator->messages()->all()
                ]);
            }
            else {
                $user = User::where('username', $request->username)->first();
                    
                if(!$user) {
                    return response()->json([
                        'message' => 'Account does not exist in our database!'
                    ]);        
                }
                else {
                    $otp = Str::random(6);
    
                    $existingOTP = OTP::where('id', $otp)->first();
                    DB::table('temporary_otp')->where('valid_for', $request->username)->delete();
        
                    while ($existingOTP) {
                            $otp = Str::random(6);
                            $existingOTP = OTP::where('id', $otp)->first();
                    }
                    $otpSent = Mail::to($user->username)->send(new OtpStringsEmail($otp));
        
                    $newOTP = OTP::create([
                            'id' => $otp,
                            'valid_for' => $request->username,
                            'expires_at' => now()->addMinutes(5), 
                    ]);   
        
                    if($otpSent && $newOTP) {
                            return response()->json([
                                'status' => 200,  
                                'email' => $request->username,  
                                'message' => "OTP is sent to your email"
                            ], 200);
                    }
                    return response()->json([
                            'status' => 404,
                            'message' => "Something went wrong in generating OTP"
                    ], 404);
                }
            }
        }
        catch (Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function validateotp(Request $request) {
        $checkOTP = OTP::where('id', $request->otp)->where('valid_for', $request->username)->where('expires_at', ">", now())->first();

        if($checkOTP) {
            $user = User::where('username', $request->username)->first();
            if($user) {
                return response()->json([
                    'status' => 200,  
                    'message' => "Please set your new password!"
                ], 200);
            }
            return response()->json([
                'message' => 'Account not Found!'
            ]);    
        }
        else {
            return response()->json([
                'message' => 'Invalid OTP or already expires!'
            ]);
        }
    }


    public function submitpassword(Request $request) {
        $checkOTP = OTP::where('id', $request->otp)->where('valid_for', $request->username)->where('expires_at', ">", now())->first();
        
        if(!$checkOTP) {
            return response()->json([
                'message' => 'Invalid OTP or already expires!'
            ]);
        }

        $validator = Validator::make($request->all(), [ 
            'newpassword' => 'required',  
        ]);
        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }

        $pattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/';
        if(!preg_match($pattern, $request->newpassword)) {
            return response()->json([
                'message' => 'Password must contain capital and small letter, number, and special character!'
            ]);    
        }

        $hashedPassword = Hash::make($request->newpassword);
        $update = User::where('username', $request->username)->update([ 'password' => $hashedPassword]);
        if($update) {   
            return response()->json([
                'status' => 200,
                'message' => 'Password changed!'
            ], 200);
        }
        else {
            return response()->json([
                'message' => 'Something went wrong!'
            ]);
        }
    }
}
