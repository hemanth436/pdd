package com.example.skillswapexchange.network;

import retrofit2.Call;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.POST;

public interface ApiService {
    @FormUrlEncoded
    @POST("register.php")
    Call<ApiResponse> register(
        @Field("fullname") String fullname,
        @Field("email") String email,
        @Field("password") String password,
        @Field("mobile") String mobile
    );

    @FormUrlEncoded
    @POST("login.php")
    Call<ApiResponse> login(
        @Field("email") String email,
        @Field("password") String password
    );
}

class ApiResponse {
    public String status;
    public String message;
}
