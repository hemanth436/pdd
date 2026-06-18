package com.example.skillswapexchange.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.RecyclerView;
import com.example.skillswapexchange.R;
import com.example.skillswapexchange.adapters.SkillAdapter;
import com.example.skillswapexchange.models.Skill;
import java.util.ArrayList;
import java.util.List;

public class HomeFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_home, container, false);
        
        RecyclerView rvSkills = view.findViewById(R.id.rvSkills);
        List<Skill> skills = new ArrayList<>();
        skills.add(new Skill("Java Programming", "Can teach basic to advanced Java.", "Alice", "Programming"));
        skills.add(new Skill("Graphic Design", "Expert in Photoshop and Illustrator.", "Bob", "Design"));
        skills.add(new Skill("Cooking Italian", "Learn to make authentic pasta.", "Charlie", "Cooking"));
        skills.add(new Skill("Guitar Lessons", "Acoustic and Electric guitar for beginners.", "David", "Music"));
        
        SkillAdapter adapter = new SkillAdapter(skills);
        rvSkills.setAdapter(adapter);
        
        return view;
    }
}
