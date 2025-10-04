<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\UsersController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\GeneralController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\SignupController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\ZAnnouncementController;
use App\Http\Controllers\Api\ZHistoryController;
use App\Http\Controllers\Api\ZNewsFareController;
use App\Http\Controllers\Api\ZProfileController;
use App\Http\Controllers\Api\ZReportController;
use App\Http\Controllers\Api\XHistoryController;
use App\Http\Controllers\Api\XProfileController;
use App\Http\Controllers\Api\XNewsFareController;
use App\Http\Controllers\Api\ZBookingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
Route::post('login', [LoginController::class, 'login']);
Route::get('app_info', [GeneralController::class, 'app_info']);
Route::post('createotpverification', [SignupController::class, 'createotpverification']);
Route::post('signupuser', [SignupController::class, 'signupuser']);
Route::post('createotp', [ForgotPasswordController::class, 'createotp']);
Route::post('validateotp', [ForgotPasswordController::class, 'validateotp']);
Route::post('submitpassword', [ForgotPasswordController::class, 'submitpassword']);
Route::prefix('commuter')->group(function () { // Kianu
    Route::post('createuser', [XHistoryController::class, 'createUser']);
});
Route::prefix('driver')->group(function () { // Kianu
    Route::post('createDriver', [ZProfileController::class, 'createDriver']);
});
//Validate the created driver
Route::get('/verify-account/{token}', [ZProfileController::class, 'verifyAccount']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [LoginController::class, 'user']);
    Route::get('logout', [LoginController::class, 'logout']);

    //Driver API
    Route::prefix('driver')->group(function () {
        Route::get('getCurrentBookings', [ZBookingController::class, 'getCurrentBookings']);
        Route::get('getMyBookings', [ZBookingController::class, 'getMyBookings']);
        Route::post('acceptBookingStatus', [ZBookingController::class, 'acceptBookingStatus']);
        Route::post('cancelBookingStatus', [ZBookingController::class, 'cancelBookingStatus']);
        Route::post('startBookingStatus', [ZBookingController::class, 'startBookingStatus']);
        Route::post('finishBookingStatus', [ZBookingController::class, 'finishBookingStatus']);

        Route::get('getProfile', [ZProfileController::class, 'getProfile']);
        Route::post('updateProfile', [ZProfileController::class, 'updateProfile']);

        Route::get('getHistory', [ZHistoryController::class, 'getHistory']);

        Route::post('getNewsFare', [ZNewsFareController::class, 'getNewsFare']);

        Route::get('getBookings', [ZReportController::class, 'getBookings']);
        Route::post('sumbitReport', [ZReportController::class, 'sumbitReport']);

        Route::get('getAnnouncement', [ZAnnouncementController::class, 'getAnnouncement']);
    });
    // End of Driver API

    Route::prefix('dashboard')->group(function () {
        Route::get('otherStats', [DashboardController::class, 'OtherStatistics']);
        Route::get('polls', [DashboardController::class, 'PollsDistribution']);
    });

    Route::prefix('admins')->group(function () {
        Route::get('/', [AdminController::class, 'index']);
    });

    Route::prefix('accounts')->group(function () {
        Route::post('/', [UsersController::class, 'index']);
        Route::post('store', [UsersController::class, 'store']);
        Route::post('update', [UsersController::class, 'update']);
        Route::get('retrieve', [UsersController::class, 'retrieve']);
        Route::get('delete', [UsersController::class, 'delete']);
        Route::post('personalchangepass', [UsersController::class, 'personalchangepass']);
    });

    Route::prefix('announcements')->group(function () {
        Route::post('/', [AnnouncementController::class, 'index']);
        Route::get('retrieve', [AnnouncementController::class, 'retrieve']);
        Route::post('addannouncement', [AnnouncementController::class, 'addannouncement']);
        Route::post('updateannouncement', [AnnouncementController::class, 'updateannouncement']);
        Route::get('deleteannouncement', [AnnouncementController::class, 'deleteannouncement']);

    });

    Route::prefix('reports')->group(function () {
        Route::post('/', [ReportController::class, 'index']);
        Route::get('retrieve', [ReportController::class, 'retrieve']);
        Route::post('updatereport', [ReportController::class, 'updatereport']);
        Route::get('deletereport', [ReportController::class, 'deletereport']);
        Route::get('reopenreport', [ReportController::class, 'reopenreport']);

    });

    Route::prefix('feedbacks')->group(function () {
        Route::post('/', [FeedbackController::class, 'index']);
        Route::get('retrieve', [FeedbackController::class, 'retrieve']);
        Route::get('deletefeedback', [FeedbackController::class, 'deletefeedback']);

    });

    Route::prefix('newsfares')->group(function () {
        Route::post('/', [NewsController::class, 'index']);
        Route::get('retrieve', [NewsController::class, 'retrieve']);
        Route::post('updatenews', [NewsController::class, 'updatenews']);
        Route::post('addnews', [NewsController::class, 'addnews']);
        Route::get('deletenews', [NewsController::class, 'deletenews']);

    });

    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingsController::class, 'index']);
        Route::post('updatesettings', [SettingsController::class, 'updatesettings']);
    });

    // Commuter
    Route::prefix('commuter')->group(function () {
        Route::get('gethistory', [XHistoryController::class, 'getHistory']);
        Route::post('updateProfile', [XProfileController::class, 'updateProfile']);
        Route::get('getProfile', [XProfileController::class, 'getProfile']);
        Route::post('getNewsFare', [XNewsFareController::class, 'getNewsFare']);
    });


});