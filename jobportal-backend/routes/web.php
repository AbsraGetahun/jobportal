<?php  
  
use Illuminate\Support\Facades\Route;  
  
Route::get("/", function () {  
    return "Job Portal API is running!";  
});  
  
Route::get("/ping", function () {  
    return "pong";  
}); 
