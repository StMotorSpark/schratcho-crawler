/**
 * Example React Native Component
 * 
 * This is a placeholder example showing how a React Native component
 * would import and use the shared core mechanics.
 * 
 * NOTE: This file will not run until React Native is properly set up.
 * It serves as a template and reference for future development.
 */

// React Native imports (would be installed via npm when setting up mobile)
// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Shared core mechanics imports - these work right now!
import { getRandomPrize, type Prize } from '../../core/mechanics/prizes';
import { getTicketLayout, TICKET_LAYOUTS, type TicketLayout } from '../../core/mechanics/ticketLayouts';
import { getScratcher, SCRATCHER_TYPES, type Scratcher } from '../../core/mechanics/scratchers';

/**
 * Example component demonstrating shared code usage
 * 
 * This shows how mobile components will:
 * 1. Import shared mechanics from /core
 * 2. Use the same prize, layout, and scratcher systems as web
 * 3. Implement mobile-specific UI with React Native components
 */
export default function ExampleTicketComponent() {
  // Example of using shared mechanics
  const exampleUsage = () => {
    // Get a random prize - works the same on web and mobile
    const prize: Prize = getRandomPrize();
    console.log('Random prize:', prize);

    // Get a ticket layout - works the same on web and mobile
    const layout: TicketLayout = getTicketLayout('classic');
    console.log('Layout:', layout.name);

    // Get available layouts - works the same on web and mobile
    const allLayouts = Object.keys(TICKET_LAYOUTS);
    console.log('Available layouts:', allLayouts);

    // Get a scratcher - works the same on web and mobile
    const scratcher: Scratcher = getScratcher('coin');
    console.log('Scratcher:', scratcher.name);

    // Get available scratchers - works the same on web and mobile
    const allScratchers = Object.keys(SCRATCHER_TYPES);
    console.log('Available scratchers:', allScratchers);
  };

  /**
   * When implementing this component with React Native:
   * 
   * return (
   *   <View style={styles.container}>
   *     <Text style={styles.title}>Schratcho Crawler Mobile</Text>
   *     <TouchableOpacity onPress={handleScratch}>
   *       <View style={styles.ticketArea}>
   *         {/* Scratch ticket UI here *\/}
   *       </View>
   *     </TouchableOpacity>
   *   </View>
   * );
   */

  // Placeholder return for TypeScript compilation
  return null;
}

/**
 * React Native StyleSheet example (would be used when React Native is set up)
 * 
 * const styles = StyleSheet.create({
 *   container: {
 *     flex: 1,
 *     justifyContent: 'center',
 *     alignItems: 'center',
 *     backgroundColor: '#1a1a2e',
 *   },
 *   title: {
 *     fontSize: 24,
 *     fontWeight: 'bold',
 *     color: '#FFD700',
 *     marginBottom: 20,
 *   },
 *   ticketArea: {
 *     width: 300,
 *     height: 400,
 *     backgroundColor: '#16213e',
 *     borderRadius: 10,
 *     padding: 20,
 *   },
 * });
 */
