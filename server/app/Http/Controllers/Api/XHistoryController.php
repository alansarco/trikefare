<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Booking;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;
use App\Models\UserUpload;
use Illuminate\Pagination\LengthAwarePaginator;
use Box\Spout\Reader\Common\Creator\ReaderEntityFactory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

class XHistoryController extends Controller
{
    // displays all list of users
    public function getHistory(Request $request) {
        // $filter = $request->filter ?? '';
        // $genderFilter = $request->gender ?? '';
        // $accountStatus = $request->account_status ?? '';
        // $accessLevel = $request->access_level ?? '';

        // Call the stored procedure
        $users = Booking::get();

        // Return the response
        if ($users) {
            return response()->json([
                'status' => 200,
                'message' => 'Users retrieved!',
                'users' => $users
            ], 200);
        } else {
            return response()->json([
                'status' => 404,
                'message' => 'No users found!'
            ]);
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
            'password' => 'required'
        ]);

        if($validator->fails()) {
            return response()->json([
                'status' => 400,
                'message' => $validator->messages()->all()
            ]);
        }
        // Check if user already exist
        $checkUserExist = User::where('username', $request->username)->count();
        if($checkUserExist > 0){
            return response()->json([
                'status' => 500,
                'message' => 'Username already taken',

            ]);
        }
        // insert the user
        $add = User::create([
            'first_name' => strtoupper($request->name),
            'last_name' => strtoupper($request->lastName),
            'username' => $request->username,
            'contact' => $request->mobile,  
            'id_number' => $request->idNumber,
            'password' => $request->password,
            'access_level' => 5
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
            ]);
        }
    }

}
