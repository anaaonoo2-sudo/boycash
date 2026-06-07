package com.boycash.app;

import android.os.Bundle;
import android.util.DisplayMetrics;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        DisplayMetrics metrics = getResources().getDisplayMetrics();
        metrics.density = metrics.density * 0.7f;
        getResources().updateConfiguration(getResources().getConfiguration(), metrics);
    }
}
