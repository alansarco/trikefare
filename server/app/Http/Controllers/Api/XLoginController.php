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
use Illuminate\Support\Facades\Validator;

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
            'username' => 'required',
            'gender' => 'required',
            'mobile' => 'required',
            'idNumber' => 'required',
            'password' => 'required',
            'email' => 'required'
        ]);

        if($validator->fails()) {
            return response()->json([
                'status' => 400,
                'message' => $validator->messages()->all()
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
            'username' => $request->username,
            'contact' => $request->mobile,  
            'id_number' => $request->idNumber,
            'password' => $request->password,
            'access_level' => 5,
            'email' => $request->email,
            'role' => 'USER',
            'account_status' => 1,
            'gender' => $request->gender
        ]);

        // Return the response
        if ($add) {
            return response()->json([
                'status' => 200,
                'message' => 'Account Created!'
            ], 200);
        } else {
            return response()->json([
                'status' => 500,
                'message' => 'Invalid User!'
            ], 500);
        }
    }
}
