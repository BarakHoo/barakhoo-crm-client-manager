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

	@Value("${app.initial.admin.password:}")
	private String adminPassword;

	@Bean
	public CommandLineRunner init(RoleRepository roleRepo, UserRepository userRepo) {
		return args -> {
			// ensure roles exist
			var sales = roleRepo.findByName("sales_agent").orElseGet(() -> { var r = new Role(); r.setName("sales_agent"); return roleRepo.save(r); });
			var manager = roleRepo.findByName("agent_manager").orElseGet(() -> { var r = new Role(); r.setName("agent_manager"); return roleRepo.save(r); });
			var boss = roleRepo.findByName("big_boss").orElseGet(() -> { var r = new Role(); r.setName("big_boss"); return roleRepo.save(r); });

			// create initial admin only if an explicit, strong password is configured
			if (userRepo.findByUsername(adminUsername).isEmpty()) {
				if (adminPassword == null || adminPassword.trim().length() < 8) {
					System.err.println("Skipping initial admin creation: set app.initial.admin.password "
						+ "(min 8 chars) to bootstrap the first big_boss user. Refusing to create a default/weak admin account.");
					return;
				}
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
