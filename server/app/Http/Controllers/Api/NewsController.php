<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\Newsfare;
use App\Models\User;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class NewsController extends Controller
{
    public function index(Request $request) {
        $query = Newsfare::select(
                '*',
                DB::raw("DATE_FORMAT(created_at, '%M %d, %Y %h:%i %p') AS date_posted"),
                DB::raw("DATE_FORMAT(updated_at, '%M %d, %Y %h:%i %p') AS date_updated"),
            )
            ->orderBy('created_at', 'DESC');

        if ($request->filter != "") {
            $query->where('details', 'LIKE', "%$request->filter%");
        }

        if ($request->asof != "") {

            if ($request->asof == "today") {
                $query->whereDate('created_at', today());
            }

            if ($request->asof == "week") {
                $query->whereBetween('created_at', [
                    now()->startOfWeek(),
                    now()->endOfWeek(),
                ]);
            }

            if ($request->asof == "month") {
                $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
            }
        }
            
        $news = $query->paginate(20);

        if ($news->count() > 0) {
            return response()->json([
                'status' => 200,
                'message' => 'News retrieved!',
                'news' => $news
            ], 200);
        } else {
            return response()->json([
                'message' => 'No news found!',
                'news' => $news
            ]);
        }

    }

    // retrieve specific event's information
    public function retrieve(Request $request) {
        $news = Newsfare::where('newsid', $request->id)
            ->first();
            
        if($news) {
            return response()->json([
                'status' => 200,
                'news' => $news,
                'message' => "News data retrieved!"
            ], 200);
        }
        else {
            return response()->json([
                'news' => $news,
                'message' => "News not found!"
            ]);
        }
    }

    public function updatenews(Request $request) {
        try {
            $validator = Validator::make($request->all(), [
                'details' => 'required',
            ]);

            if($validator->fails()) {
                return response()->json([
                    'message' => $validator->messages()->all()
                ]);
            }

            $update = Newsfare::where('newsid', $request->id) ->update([ 
                'details' => $request->details,
                'updated_by' =>Auth::user()->username
            ]);

            if($update) {
                return response()->json([
                    'status' => 200,
                    'message' => 'News updated successfully!'
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

    public function addnews(Request $request) {
        try {
            $validator = Validator::make($request->all(), [
                'details' => 'required',
            ]);

            if($validator->fails()) {
                return response()->json([
                    'message' => $validator->messages()->all()
                ]);
            }

            $add = Newsfare::create([
            'details' => $request->details,
                'updated_by' =>Auth::user()->username
            ]);
            
            if($add) {
                return response()->json([
                    'status' => 200,
                    'message' => 'News added successfully!'
                ], 200);
            }
            return response()->json([
                'message' => 'Something went wrong!'
            ]);
            
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ]);
        }
    }

    public function deletenews(Request $request) {
        $delete = Newsfare::where('newsid', $request->id)->delete();

        if($delete) {
            return response()->json([
                'status' => 200,
                'message' => 'News removed successfully!'
            ], 200);
        }
        return response()->json([
            'message' => 'Something went wrong!'
        ]);
    }

}