package org.goblin.Frame;

import javax.swing.JFrame;
import java.awt.Dimension;
import org.goblin.Utils.Theme;

public class Frame extends JFrame {
	
	private static final long serialVersionUID = -4442947819954124379L;
	
	public Frame() {
		this.setTitle("Chess.com Desktop Clone");
		this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		this.setResizable(false);
		this.getContentPane().setBackground(Theme.BG_LIGHT);
		
		initStartScreen(); // Show start overlay right sidebar initially
		
		this.setLocationRelativeTo(null);
		this.setVisible(true);
	}
	
	public void initStartScreen() {
		this.getContentPane().removeAll();
		this.setLayout(new java.awt.BorderLayout());
		
		// Left Sidebar
		this.add(new LeftSidebarPanel(), java.awt.BorderLayout.WEST);
		
		// Center Game Area (Inactive board waiting for game start)
		GameContainerPanel centerPanel = new GameContainerPanel(0);
		// Optionally lock it here or let them drag around freely
		this.add(centerPanel, java.awt.BorderLayout.CENTER);
		
		// Right Sidebar (Start Menu)
		this.add(new RightSidebarStartPanel(this), java.awt.BorderLayout.EAST);
		
		this.pack();
		this.revalidate();
		this.repaint();
	}
	
	public void startGame(int timeInSeconds) {
		this.getContentPane().removeAll();
		this.setLayout(new java.awt.BorderLayout());
		
		// Reload Left Sidebar
		this.add(new LeftSidebarPanel(), java.awt.BorderLayout.WEST);
		
		// Load actual Game board and timer
		GameContainerPanel centerPanel = new GameContainerPanel(timeInSeconds);
		this.add(centerPanel, java.awt.BorderLayout.CENTER);
		
		// Swap right sidebar to the Game controls
		RightSidebarPanel rightSidebar = new RightSidebarPanel(this, centerPanel);
		centerPanel.setRightSidebar(rightSidebar);
		this.add(rightSidebar, java.awt.BorderLayout.EAST);
		
		this.pack();
		this.revalidate();
		this.repaint();
		// Set focus back so KeyListener works for undo
		centerPanel.requestFocusInWindow();
	}
}
