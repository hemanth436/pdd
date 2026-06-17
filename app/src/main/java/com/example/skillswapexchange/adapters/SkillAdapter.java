package com.example.skillswapexchange.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.skillswapexchange.R;
import com.example.skillswapexchange.models.Skill;
import java.util.List;

public class SkillAdapter extends RecyclerView.Adapter<SkillAdapter.SkillViewHolder> {

    private List<Skill> skillList;

    public SkillAdapter(List<Skill> skillList) {
        this.skillList = skillList;
    }

    @NonNull
    @Override
    public SkillViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_skill, parent, false);
        return new SkillViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull SkillViewHolder holder, int position) {
        Skill skill = skillList.get(position);
        holder.tvTitle.setText(skill.getTitle());
        holder.tvCategory.setText(skill.getCategory());
        holder.tvDescription.setText(skill.getDescription());
        holder.tvUserName.setText("By: " + skill.getUserName());
    }

    @Override
    public int getItemCount() {
        return skillList.size();
    }

    static class SkillViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvCategory, tvDescription, tvUserName;

        public SkillViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvSkillTitle);
            tvCategory = itemView.findViewById(R.id.tvSkillCategory);
            tvDescription = itemView.findViewById(R.id.tvSkillDescription);
            tvUserName = itemView.findViewById(R.id.tvUserName);
        }
    }
}
