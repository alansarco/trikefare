<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;
use App\Models\UserUpload;
use Illuminate\Pagination\LengthAwarePaginator;
use Box\Spout\Reader\Common\Creator\ReaderEntityFactory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
{
    // displays all list of users
    public function index(Request $request) {
        $filter = $request->filter ?? '';
        $genderFilter = $request->gender ?? '';
        $accountStatus = $request->account_status ?? '';
        $accessLevel = $request->access_level ?? '';

        // Call the stored procedure
        $users = DB::select('CALL GET_USERS(?, ?, ?, ?)', [$filter, $genderFilter, $accountStatus, $accessLevel]);

        // Convert the results into a collection
        $usersCollection = collect($users);

        // Set pagination variables
        $perPage = 50; // Number of items per page
        $currentPage = LengthAwarePaginator::resolveCurrentPage(); // Get the current page

        // Slice the collection to get the items for the current page
        $currentPageItems = $usersCollection->slice(($currentPage - 1) * $perPage, $perPage)->values();

        // Create a LengthAwarePaginator instance
        $paginatedUsers = new LengthAwarePaginator($currentPageItems, $usersCollection->count(), $perPage, $currentPage, [
            'path' => $request->url(), // Set the base URL for pagination links
            'query' => $request->query(), // Preserve query parameters in pagination links
        ]);

        // Return the response
        if ($paginatedUsers->count() > 0) {
            return response()->json([
                'status' => 200,
                'message' => 'Users retrieved!',
                'users' => $paginatedUsers
            ], 200);
        } else {
            return response()->json([
                'message' => 'No users found!',
                'users' => $paginatedUsers
            ]);
        }
    }

    // retrieve specific user's information
    public function retrieve(Request $request) {
        $account = User::where('username', $request->username)->first();
        $haveAccount = false;
        if($account) {
            $haveAccount = true;
        }

        $user = User::select('*',
            DB::raw("TO_BASE64(id_picture) as id_picture"),
            DB::raw("CONCAT(DATE_FORMAT(birthdate, '%M %d, %Y')) as birthday"),
            DB::raw("CONCAT(DATE_FORMAT(created_at, '%M %d, %Y %h:%i %p')) as date_added"),
            DB::raw("CONCAT(DATE_FORMAT(last_online, '%M %d, %Y %h:%i %p')) as last_online"),
            DB::raw("CONCAT(DATE_FORMAT(created_at, '%M %d, %Y %h:%i %p')) as created_date"),
            DB::raw("CONCAT(DATE_FORMAT(updated_at, '%M %d, %Y %h:%i %p')) as updated_date"),
        )
        ->where('username', $request->username)->first();

        if($user) {
            return response()->json([
                'status' => 200,
                'user' => $user,
                'haveAccount' => $haveAccount,
                'message' => "Data retrieved!"
            ], 200);
        }
        else {
            return response()->json([
                'user' => $user,
                'message' => "Data not found!"
            ]);
        }
    }

    // update specific user's information
    public function update(Request $request) {
        $validator = Validator::make($request->all(), [
            'username' => 'required',
            'first_name' => 'required',
            'middle_name' => 'required',
            'last_name' => 'required',
            'gender' => 'required',
            'account_status' => 'required',
            'address' => 'required',
            'contact' => 'required',
            'access_level' => 'required',
            'id_number' => 'required',
            'birthdate' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }
        else {
            $user = User::where('username', $request->username)->first();
            $role = 'USER';
            if($request->access_level == 999) {
                $role = 'ADMIN';
            }

            if($user) {
                try {
                    $update = User::where('username', $request->username)
                    ->update([
                        'first_name' => strtoupper($request->first_name),
                        'middle_name' => strtoupper($request->middle_name),
                        'last_name' => strtoupper($request->last_name),
                        'gender' => $request->gender,   
                        'address' => $request->address,   
                        'contact' => $request->contact,   
                        'role' => strtoupper($role),   
                        'access_level' => $request->access_level,   
                        'account_status' => $request->account_status,   
                        'id_number' => $request->id_number,   
                        'birthdate' => $request->birthdate,  
                        'updated_by' => Auth::user()->username,
                    ]);

                    if($update) {
                        return response()->json([
                            'status' => 200,
                            'message' => 'User updated successfully!'
                        ], 200);
                    }
                    else {
                        return response()->json([
                            'message' => 'Something went wrong!'
                        ]);
                    }
                } catch (Exception $e) {
                    return response()->json([
                        'message' => $e->getMessage()
                    ]);
                }
            }
            else {
                return response()->json([
                    'message' => 'User not found!'
                ]);
            }
        }
    }

    // Delete / deactivate user
    public function delete(Request $request) {
        $authUser = Auth::user();
        if($authUser->role !== "ADMIN" || $authUser->access_level < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }
        
        $delete = User::where('username', $request->username)->delete();

        if($delete) {
            return response()->json([
                'status' => 200,
                'message' => 'Account deleted successfully!'
            ], 200);
        }
        else {
            return response()->json([
                'message' => 'Account not found!'
            ]);
        }
    }

    public function store(Request $request) {
        $authUser = User::select('first_name')->where('username', Auth::user()->username)->first();

        if(Auth::user()->role !== "ADMIN" || Auth::user()->role < 10) {
            return response()->json([
                'message' => 'You are not allowed to perform this action!'
            ]);
        }

        $validator = Validator::make($request->all(), [
            'username' => 'required',
            'first_name' => 'required',
            'last_name' => 'required',
            'gender' => 'required',
            'contact' => 'required',
            'birthdate' => 'required',
            'address' => 'required',
            'access_level' => 'required',
            'id_picture' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }

        $accountExist = User::where('username', $request->username)->first();
        $role = 'USER';
        
        if($request->access_level == 999) {
            $role = 'ADMIN';
        }

        if(!$accountExist) {
            try {
                $pictureData = null; // Initialize the variable to hold the file path
                if ($request->hasFile('id_picture')) {
                    $file = $request->file('id_picture');
                    $pictureData = file_get_contents($file->getRealPath()); // Get the file content as a string
                }
                $add = User::create([
                    'username' => $request->username,
                    'first_name' => strtoupper($request->first_name),
                    'middle_name' => strtoupper($request->middle_name),
                    'last_name' => strtoupper($request->last_name),
                    'gender' => $request->gender,   
                    'address' => $request->address,   
                    'contact' => $request->contact,   
                    'role' => strtoupper($role),   
                    'id_picture' => $pictureData,   
                    'access_level' => $request->access_level,   
                    'id_number' => $request->id_number,   
                    'birthdate' => $request->birthdate,  
                    'account_status' => 1,  
                    'created_by' => $authUser->name,
                ]);

            if($add) {
                return response()->json([
                    'status' => 200,
                    'message' => 'Account added successfully!'
                ], 200);
            }
            else {
                return response()->json([
                    'message' => 'Something went wrong!'
                ]);
            }
            } catch (Exception $e) {
                return response()->json([
                    'message' => $e->getMessage()
                ]);
            }
        }
        else {
            return response()->json([
                'message' => 'LRN already exist!'
            ]);
        }
    }


    // Change your password
    public function personalchangepass(Request $request) {
        $authUser = Auth::user();

        $pattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/';
        if(!preg_match($pattern, $request->newpass)) {
            return response()->json([
                'message' => 'Password must contain capital and small letter, number, and special character!'
            ]);    
        }

        $validator = Validator::make($request->all(), [
            'newpass' => 'required',
            'confirmpass' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->all()
            ]);
        }
        
        else {
            $user = User::where('username', $authUser->username)->first();
            if($user) {
                try {
                    if($request->newpass !== $request->confirmpass) {
                        return response()->json([
                            'message' => 'Password did not match!'
                        ]);        
                    }
                    if($request->password === $request->confirmpass) {
                        return response()->json([
                            'message' => 'Old and new password is the same!'
                        ]);
                    }
                    $hashedPassword = Hash::make($request->newpass);
                    $update = User::where('username', $authUser->username)->update([ 'password' => $hashedPassword]);
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
                } catch (Exception $e) {
                    return response()->json([
                        'message' => $e->getMessage()
                    ]);
                }
            } else {
                return response()->json([
                    'message' => 'Something went wrong!'
                ]);
            }

        }
    }
}
