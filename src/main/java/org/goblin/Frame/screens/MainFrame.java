package org.goblin.Frame.screens;

import org.goblin.Frame.modules.GameControlPanel;
import org.goblin.Frame.modules.GameSetupPanel;
import org.goblin.Frame.navigation.MainMenuPanel;
import org.goblin.Utils.Theme;

import javax.swing.*;

public class MainFrame extends JFrame {
	
	private static final long serialVersionUID = -4442947819954124379L;
	
	public MainFrame() {
		this.setTitle("Chess.com Desktop Clone");
		this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		this.setResizable(false);
		this.getContentPane().setBackground(Theme.BG_LIGHT);
		
		showLoginScreen(); // Show Login screen initially
		
		this.pack();
		this.setLocationRelativeTo(null);
		this.setVisible(true);
	}
	
	public void showLoginScreen() {
		this.getContentPane().removeAll();
		this.setLayout(new java.awt.BorderLayout());
		this.add(new LoginScreen(this), java.awt.BorderLayout.CENTER);
		
		this.pack();
		this.setLocationRelativeTo(null);
		this.revalidate();
		this.repaint();
	}
	
	public void showRegisterScreen() {
		this.getContentPane().removeAll();
		this.setLayout(new java.awt.BorderLayout());
		this.add(new RegisterScreen(this), java.awt.BorderLayout.CENTER);
		
		this.pack();
		this.revalidate();
		this.repaint();
	}
	
	public void loginSuccess() {
		initStartScreen();
	}
	
	public void initStartScreen() {
		this.getContentPane().removeAll();
		this.setLayout(new java.awt.BorderLayout());
		
		// Left Sidebar
		this.add(new MainMenuPanel(this), java.awt.BorderLayout.WEST);
		
		// Center Game Area (Inactive board waiting for game start)
		GameScreen centerPanel = new GameScreen(0, false);
		// Optionally lock it here or let them drag around freely
		this.add(centerPanel, java.awt.BorderLayout.CENTER);
		
		// Right Sidebar (Start Menu)
		this.add(new GameSetupPanel(this), java.awt.BorderLayout.EAST);
		
		this.pack();
		this.revalidate();
		this.repaint();
	}
	
	public void startGame(int timeInSeconds) {
		this.getContentPane().removeAll();
		this.setLayout(new java.awt.BorderLayout());
		
		// Reload Left Sidebar
		this.add(new MainMenuPanel(this), java.awt.BorderLayout.WEST);
		
		// Load actual Game board and timer
		GameScreen centerPanel = new GameScreen(timeInSeconds, true);
		this.add(centerPanel, java.awt.BorderLayout.CENTER);
		
		// Swap right sidebar to the Game controls
		GameControlPanel rightSidebar = new GameControlPanel(this, centerPanel);
		centerPanel.setRightSidebar(rightSidebar);
		this.add(rightSidebar, java.awt.BorderLayout.EAST);
		
		this.pack();
		this.revalidate();
		this.repaint();
		// Set focus back so KeyListener works for undo
		centerPanel.requestFocusInWindow();
	}
}
