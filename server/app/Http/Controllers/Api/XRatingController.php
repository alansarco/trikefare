<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Rating;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\AESCipher;
use App\Models\App_Info;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class XRatingController extends Controller {

    // create rating
    public function createRating(Request $request) {
        
        $validator = Validator::make($request->all(), [
            'experience' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'status' => 400,
                'message' => 'Experience field is required!'
            ], 400);
        }

        $rating = Rating::updateOrCreate(
            ['user' => Auth::user()->username],
            // Fields to update or insert
            [
                'suggestion' => $request->suggestion,
                'experience' => $request->experience,
                'rate' => $request->rate,
            ]
        );

        if ($rating) {
            return response()->json([
                'status' => 200,
                'message' => 'Thanks for Rating Us!'
            ], 200);
        } else {
            return response()->json([
                'status' => 500,
                'message' => 'Something went wrong. Please try again later!'
            ]);
        }
    }

}
