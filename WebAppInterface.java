// WebAppInterface.java - Tambahkan di project Android
public class WebAppInterface {
    private Context mContext;
    
    public WebAppInterface(Context context) {
        mContext = context;
    }
    
    @JavascriptInterface
    public boolean isPackageInstalled(String packageName) {
        try {
            mContext.getPackageManager().getPackageInfo(packageName, 0);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }
    
    @JavascriptInterface
    public void openGame(String packageName, String uri) {
        Intent intent = mContext.getPackageManager().getLaunchIntentForPackage(packageName);
        if (intent != null) {
            mContext.startActivity(intent);
        } else {
            // Buka Play Store
            try {
                mContext.startActivity(new Intent(Intent.ACTION_VIEW, 
                    Uri.parse("market://details?id=" + packageName)));
            } catch (Exception e) {
                mContext.startActivity(new Intent(Intent.ACTION_VIEW, 
                    Uri.parse("https://play.google.com/store/apps/details?id=" + packageName)));
            }
        }
    }
}
