package com.boycash.app;

import android.os.Bundle;
import android.os.Build;
import android.view.View;
import android.view.WindowManager;
import android.view.WindowInsetsController;
import android.view.WindowInsets;
import android.util.DisplayMetrics;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(true);
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.show(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_DEFAULT);
            }
        }

        DisplayMetrics metrics = getResources().getDisplayMetrics();
        metrics.density = metrics.density * 0.7f;
        getResources().updateConfiguration(getResources().getConfiguration(), metrics);

        // رصد ارتفاع الكيبورد الحقيقي عبر WindowInsets وإرساله إلى JS
        final View rootView = getWindow().getDecorView().findViewById(android.R.id.content);
        rootView.setOnApplyWindowInsetsListener((view, insets) -> {
            int keyboardHeight = 0;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                keyboardHeight = insets.getInsets(WindowInsets.Type.ime()).bottom;
            } else {
                // fallback لإصدارات أقدم: قياس الفرق بين ارتفاع الشاشة والمساحة المرئية
                android.graphics.Rect r = new android.graphics.Rect();
                view.getWindowVisibleDisplayFrame(r);
                int screenHeight = view.getRootView().getHeight();
                int heightDiff = screenHeight - (r.bottom - r.top);
                keyboardHeight = heightDiff > screenHeight * 0.15 ? heightDiff : 0;
            }

            final int finalHeight = keyboardHeight;
            runOnUiThread(() -> {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    String js = "window.dispatchEvent(new CustomEvent('androidKeyboard', { detail: { height: " + finalHeight + " } }));";
                    getBridge().getWebView().evaluateJavascript(js, null);
                }
            });

            return insets;
        });
    }
}
