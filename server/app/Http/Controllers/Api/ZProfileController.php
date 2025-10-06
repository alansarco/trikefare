<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\App_Info;
use App\Http\Controllers\AESCipher;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ZProfileController extends Controller
{

    protected $aes;
    public function __construct()
    {
        $this->aes = new AESCipher;
    }

    // create user
    public function createDriver(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required',
            'last_name' => 'required',
            'contact_number' => 'required',
            'id_number' => 'required',
            'gender' => 'required',
            'email' => 'required',
            'address' => 'required',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 500,
                'message' => 'All fields are required!'
            ]);
        }
        // Check if user already exist
        $checkUserExist = User::where('username', $request->email)->orWhere('email', $request->email)->count();
        if ($checkUserExist > 0) {
            return response()->json([
                'status' => 500,
                'message' => 'Email already taken',
            ]);
        }
        // insert the user
        $add = User::create([
            'first_name' => strtoupper($request->first_name),
            'last_name' => strtoupper($request->last_name),
            'username' => $request->email,
            'email' => $request->email,
            'contact' => $request->contact_number,
            'id_number' => $request->id_number,
            'password' => $request->password,
            'role' => 'USER',
            'access_level' => 10,
            'gender' => $request->gender,
            'verify_token' => Str::random(25),
        ]);

        // Return the response
        if ($add) {
            $verifyUrl = url('/api/verify-account/' . $add->verify_token);
            try {
                Mail::raw("Thank you for registering to TrikeFare. Click here to verify your account: $verifyUrl", function ($message) use ($request) {
                    $message->to($request->email)
                        ->subject('Verify your account');
                });
            } catch (\Exception $e) {
                // Log the error but don’t stop registration
                Log::error("Verification email failed to send: " . $e->getMessage());
            }
            return response()->json([
                'status' => 200,
                'message' => 'Account registered successfully. Check your email to validate!'
            ], 200);
        } else {
            return response()->json([
                'status' => 500,
                'message' => 'Something went wong. Please try again later!'
            ]);
        }
    }

    public function verifyAccount($token)
    {
        $user = User::where('verify_token', $token)->first();

        if (!$user) {
            return response()->view('verification', [
            'status' => 'error',
            'message' => 'Invalid or expired verification link.'
        ]);
        }

        $user->account_status = 0;
        $user->verify_token = null; // clear the token so it can’t be reused
        $user->save();

        return response()->view('verification', [
            'status' => 'success',
            'message' => 'Your email has been successfully verified. The admin will still validate and approve your account in order for you to login.'
        ]);
    }


    public function getProfile()
    {
        try {
            $profile = User::select(
                'username',
                'first_name',
                'last_name',
                'contact',
                'id_number',
                'email',
                'gender',
                'address',
                DB::raw("CONCAT_WS(' ', first_name, middle_name, last_name) as fullname"),
                // DB::raw("TO_BASE64(id_picture) as id_picture"),
                // DB::raw("CONCAT('data:image/png;base64,', TO_BASE64(id_picture)) as id_picture")
                // DB::raw("CONCAT('data:image/png;base64,', REPLACE(REPLACE(TO_BASE64(id_picture), '\n', ''), '\r', '')) as id_picture")
            )

                ->where('username', Auth::user()->username)->first();


            if ($profile) {
                return response()->json([
                    'status' => 200,
                    'profile' => $profile,
                    'message' => "User profile retrieved!"
                ]);
            } else {
                return response()->json([
                    'status' => 500,
                    'profile' => $profile,
                    'message' => "User profile not found!"
                ]);
            }
        } catch (Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'first_name' => 'required',
                'last_name' => 'required',
                'contact' => 'required',
                'id_number' => 'required',
                'gender' => 'required',
                'email' => 'required',
                'address' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 500,
                    'message' => 'All fields are required!'
                ]);
            }
            $emailExist = User::where('username', '!=', Auth::user()->username)
                ->where('email', $request->email)
                ->first();

            if ($emailExist) {
                return response()->json([
                    'status' => 500,
                    'message' => 'Email already taken!'
                ], 500);
            }

            $update = User::where('username', Auth::user()->username)
                ->update([
                    'first_name' => strtoupper($request->first_name),
                    'last_name' => strtoupper($request->lastName),
                    'gender' => $request->gender,
                    'email' => $request->email,
                    'address' => $request->address,
                    'contact' => $request->contact,
                    'id_number' => $request->id_number,
                ]);

            if ($update) {
                $profile = User::select(
                    'username',
                    'first_name',
                    'last_name',
                    'contact',
                    'id_number',
                    'email',
                    'gender',
                    'address',
                    DB::raw("CONCAT_WS(' ', first_name, middle_name, last_name) as fullname")
                )
                    ->where('username', Auth::user()->username)->first();

                if ($profile) {
                    return response()->json([
                        'status' => 200,
                        'profile' => $profile,
                        'message' => 'Profile updated successfully!'
                    ], 200);
                }
                return response()->json([
                    'status' => 500,
                    'profile' => $profile,
                    'message' => 'Something went Wrong!'
                ], 500);
            } else {
                return response()->json([
                    'status' => 500,
                    'message' => 'Something went Wrong!'
                ], 500);
            }
        } catch (Exception $e) {
            return response()->json([
                'status' => 404,
                'message' => $e->getMessage()
            ], 404);
        }
    }
}
