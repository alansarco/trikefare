<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OTP;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Str;
use Exception;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

use Carbon\Carbon;

class MobileForgotPasswordController extends Controller
{
    public function sendEmail(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required',
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'status' => 500,
                    'message' => 'Email is required!'
                ]);
            } else {
                $user = User::where('username', $request->email)->where('account_status', 1)->first();
                if (!$user) {
                    return response()->json([
                        'status' => 500,
                        'message' => 'Account does not exist or no longer active!'
                    ]);
                } else {
                    $otp = Str::random(6);

                    $existingOTP = OTP::where('id', $otp)->first();
                    DB::table('temporary_otp')->where('valid_for', $request->email)->delete();
                    while ($existingOTP) {
                        $otp = Str::random(6);
                        $existingOTP = OTP::where('id', $otp)->first();
                    }
                    try {
                        Mail::raw("Hello $request->email, your OTP is $otp and will expire after 5 minutes.", function ($message) use ($request) {
                            $message->to($request->email)
                                ->subject('Reset Password Verification Code');
                        });
                    } catch (\Exception $e) {
                        // Log the error but don’t stop registration
                        Log::error("Email failed to send: " . $e->getMessage());
                    }

                    $newOTP = OTP::create([
                        'id' => $otp,
                        'valid_for' => $request->email,
                        'expires_at' => now()->addMinutes(5),
                    ]);

                    if ($newOTP) {
                        return response()->json([
                            'status' => 200,
                            'email' => $request->email,
                            'message' => "OTP is sent to your email"
                        ], 200);
                    }
                    return response()->json([
                        'status' => 500,
                        'message' => "Something went wrong in generating OTP"
                    ]);
                }
            }
        } catch (Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function sendOTP(Request $request)
    {
        $now = Carbon::now();
        $checkOTP = OTP::where('id', $request->code)->where('valid_for', $request->email)->where('expires_at', ">", $now)->first();

        if ($checkOTP) {
            $user = User::where('username', $request->email)->first();
            if ($user) {
                return response()->json([
                    'status' => 200,
                    'message' => "Please set your new password!"
                ], 200);
            }
            return response()->json([
                'status' => 500,
                'message' => 'Account not Found!'
            ]);
        } else {
            return response()->json([
                'status' => 500,
                'message' => 'Invalid OTP or already expires!'
            ]);
        }
    }

    public function setPassword(Request $request)
    {
        try {
            $hashedPassword = Hash::make($request->password);
            $update = User::where('username', $request->email)->update(['password' => $hashedPassword]);
            if ($update) {
                return response()->json([
                    'status' => 200,
                    'message' => 'Password changed!'
                ], 200);
            } else {
                return response()->json([
                    'status' => 500,
                    'message' => 'Something went wrong!'
                ]);
            }
        } catch (Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
