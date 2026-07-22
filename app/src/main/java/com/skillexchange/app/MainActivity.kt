package com.skillexchange.app

import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.skillexchange.app.ui.theme.SkillExchangeTheme

class MainActivity : ComponentActivity() {
    private var webView: WebView? = null
    private var webServer: AppWebServer? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Start internal embedded web server on port 8080
        try {
            webServer = AppWebServer(this, 8080)
            webServer?.start()
        } catch (e: Exception) {
            e.printStackTrace()
        }

        setContent {
            SkillExchangeTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    WebAppContainer(
                        url = "http://127.0.0.1:8080/",
                        onWebViewCreated = { webView = it }
                    )
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        webServer?.stop()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView?.canGoBack() == true) {
            webView?.goBack()
        } else {
            super.onBackPressed()
        }
    }
}

@Composable
fun WebAppContainer(url: String, onWebViewCreated: (WebView) -> Unit) {
    AndroidView(
        factory = { context ->
            WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.databaseEnabled = true
                settings.allowFileAccess = true
                settings.allowContentAccess = true
                settings.loadWithOverviewMode = true
                settings.useWideViewPort = true
                settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                settings.cacheMode = WebSettings.LOAD_NO_CACHE

                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView?, loadingUrl: String?): Boolean {
                        loadingUrl?.let { view?.loadUrl(it) }
                        return true
                    }
                }

                loadUrl(url)
                onWebViewCreated(this)
            }
        },
        modifier = Modifier.fillMaxSize()
    )
}
