package com.example.skillswapexchange.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.example.skillswapexchange.R;
import com.google.android.material.textfield.TextInputEditText;

public class PostFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_post, container, false);
        
        TextInputEditText etTitle = view.findViewById(R.id.etTitle);
        TextInputEditText etCategory = view.findViewById(R.id.etCategory);
        TextInputEditText etDescription = view.findViewById(R.id.etDescription);
        Button btnSubmit = view.findViewById(R.id.btnSubmit);
        
        btnSubmit.setOnClickListener(v -> {
            String title = String.valueOf(etTitle.getText()).trim();
            String category = String.valueOf(etCategory.getText()).trim();
            String description = String.valueOf(etDescription.getText()).trim();

            if (!title.isEmpty() && !category.isEmpty() && !description.isEmpty()) {
                Toast.makeText(getContext(), "Skill '" + title + "' in " + category + " posted!", Toast.LENGTH_SHORT).show();
                // Clear fields
                etTitle.setText("");
                etCategory.setText("");
                etDescription.setText("");
            } else {
                Toast.makeText(getContext(), "Please fill in all fields", Toast.LENGTH_SHORT).show();
            }
        });
        
        return view;
    }
}
