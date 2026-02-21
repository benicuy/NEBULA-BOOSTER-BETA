package com.nebula.booster;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    
    private WebView webView;
    private static final int OVERLAY_PERMISSION_REQUEST = 1001;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        webView = findViewById(R.id.webview);
        setupWebView();
        
        // Cek izin overlay untuk Android 6+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(this)) {
                // Minta izin
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:" + getPackageName()));
                startActivityForResult(intent, OVERLAY_PERMISSION_REQUEST);
            }
        }
    }
    
    private void setupWebView() {
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        
        // Penting: untuk buka intent
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // Tangani URL intent untuk buka game
                if (url.startsWith("mobilelegends://") || 
                    url.startsWith("freefire://") || 
                    url.startsWith("pubgm://") ||
                    url.startsWith("intent://")) {
                    
                    try {
                        Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        // Game belum terinstall, buka Play Store
                        String packageName = extractPackageName(url);
                        if (packageName != null) {
                            openPlayStore(packageName);
                        }
                        return true;
                    }
                }
                return false;
            }
        });
        
        // Tambah interface untuk komunikasi
        webView.addJavascriptInterface(new WebAppInterface(), "Android");
        
        // Load HTML dari assets
        webView.loadUrl("file:///android_asset/index.html");
    }
    
    // Interface untuk JavaScript
    public class WebAppInterface {
        
        @JavascriptInterface
        public boolean isPackageInstalled(String packageName) {
            try {
                getPackageManager().getPackageInfo(packageName, 0);
                return true;
            } catch (PackageManager.NameNotFoundException e) {
                return false;
            }
        }
        
        @JavascriptInterface
        public void openGame(String packageName, String uri) {
            runOnUiThread(() -> {
                try {
                    // Coba buka dengan URI scheme
                    if (uri != null && !uri.isEmpty()) {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(uri));
                        startActivity(intent);
                        return;
                    }
                    
                    // Fallback ke intent
                    Intent intent = getPackageManager().getLaunchIntentForPackage(packageName);
                    if (intent != null) {
                        startActivity(intent);
                    } else {
                        openPlayStore(packageName);
                    }
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, 
                        "Gagal membuka game", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }
    
    private String extractPackageName(String intentUrl) {
        try {
            if (intentUrl.contains("package=")) {
                String[] parts = intentUrl.split("package=");
                if (parts.length > 1) {
                    String pkg = parts[1];
                    if (pkg.contains(";")) {
                        pkg = pkg.substring(0, pkg.indexOf(";"));
                    }
                    return pkg;
                }
            }
        } catch (Exception e) {}
        return null;
    }
    
    private void openPlayStore(String packageName) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, 
                Uri.parse("market://details?id=" + packageName)));
        } catch (ActivityNotFoundException e) {
            startActivity(new Intent(Intent.ACTION_VIEW, 
                Uri.parse("https://play.google.com/store/apps/details?id=" + packageName)));
        }
    }
}
