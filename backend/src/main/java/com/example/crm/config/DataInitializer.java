package com.example.crm.config;

import com.example.crm.model.Role;
import com.example.crm.model.User;
import com.example.crm.repository.RoleRepository;
import com.example.crm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Set;

@Configuration
public class DataInitializer {

	@Value("${app.initial.admin.username:admin}")
	private String adminUsername;

	@Value("${app.initial.admin.password:admin}")
	private String adminPassword;

	@Bean
	public CommandLineRunner init(RoleRepository roleRepo, UserRepository userRepo) {
		return args -> {
			// ensure roles exist
			var sales = roleRepo.findByName("sales_agent").orElseGet(() -> { var r = new Role(); r.setName("sales_agent"); return roleRepo.save(r); });
			var manager = roleRepo.findByName("agent_manager").orElseGet(() -> { var r = new Role(); r.setName("agent_manager"); return roleRepo.save(r); });
			var boss = roleRepo.findByName("big_boss").orElseGet(() -> { var r = new Role(); r.setName("big_boss"); return roleRepo.save(r); });

			// create initial admin if not present
			if (userRepo.findByUsername(adminUsername).isEmpty()) {
				var u = new User();
				u.setUsername(adminUsername);
				u.setEmail(adminUsername + "@localhost");
				u.setPasswordHash(new BCryptPasswordEncoder().encode(adminPassword));
				u.setEnabled(true);
				u.setRoles(Set.of(boss));
				userRepo.save(u);
				System.out.println("Created initial big_boss user: " + adminUsername);
			}
		};
	}
}
