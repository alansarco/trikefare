<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\AESCipher;
use App\Models\App_Info;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class XLoginController extends Controller {

    protected $aes;
    public function __construct() {
        $this->aes = new AESCipher;

    }
    public function login(Request $request)  {
        $rules = [
            'username' => 'required|string',
            'password' => 'required|string',
        ];
        $credentials = $request->validate($rules);

        if (!Auth::attempt($credentials)) {
            // End
            return response()->json([
                "status" => 400,
                'message' => "Invalid account credentials!"
            ], 400);
        }   

        $verifyUser = User::select('username', 'access_level', 'role', 
                DB::raw("CONCAT_WS(' ', first_name, middle_name, last_name) as fullname"
            ))
            ->where('access_level', 5)
            ->where('username', $request->username)
            ->where('account_status', 1)
            ->first();

        if ($verifyUser) {
            User::where('username', $verifyUser->username)->update(['last_online' => Carbon::now()]);
            /** @var \App\Models\User $user */
            $user = Auth::user();
            $expirationTime = now()->addMinutes(60);
            $token = $user->createToken($user->username, ['expires_at' => $expirationTime])->plainTextToken;
            $cookie = cookie('jwt', $token, 60);
            
            return response()->json([
                'status' => 200,
                'user' => $user->username,
                'role' => $user->role,
                'access' => $user->access_level,
                'fullname' => $verifyUser->fullname ?? "N/A",
                'contact' => $user->contact ?? "N/A",
                'access_token' => $token,
                'message' => "Login Success!"
            ])->withCookie($cookie);

        } else {
            return response()->json([
                "status" => 403,
                'message' => 'Account is no longer active!'  
            ], 403);
        }
    }
    // create user
    public function createUser(Request $request) {
        
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'lastName' => 'required',
            'gender' => 'required',
            'mobile' => 'required',
            // 'idNumber' => 'required',
            'password' => 'required',
            'email' => 'required'
        ]);

        if($validator->fails()) {
            return response()->json([
                'status' => 400,
                'message' => 'All fields are required!'
            ], 400);
        }
        // Check if user already exist
        $checkUserExist = User::where('username', $request->username)->orWhere('email', $request->email)->count();
        if($checkUserExist > 0){
            return response()->json([
                'status' => 400,
                'message' => 'Username or Email already taken',
            ], 400);
        }
        // insert the user
        $add = User::create([
            'first_name' => strtoupper($request->name),
            'last_name' => strtoupper($request->lastName),
            'username' => $request->email,
            'contact' => $request->mobile,  
            'id_number' => $request->idNumber,
            'password' => $request->password,
            'access_level' => 5,
            'email' => $request->email,
            'role' => 'USER',
            'gender' => $request->gender,
            'verify_token' => Str::random(25),
        ]);

        // Return the response
        if ($add) {
            $verifyUrl = url('/api/verify-passenger-account/' . $add->verify_token);
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

    public function verifyPassengerAccount($token)
    {
        $user = User::where('verify_token', $token)->first();

        if (!$user) {
            return response()->view('verification', [
            'status' => 'error',
            'message' => 'Invalid or expired verification link.'
        ]);
        }

        $user->account_status = 1;
        $user->verify_token = null; // clear the token so it can’t be reused
        $user->save();

        return response()->view('verification', [
            'status' => 'success',
            'message' => 'Your account has been successfully verified. You may now login.'
        ]);
    }
}
