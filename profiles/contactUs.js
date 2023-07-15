import React from 'react';
import { View, Text, Linking, TouchableOpacity, StyleSheet } from 'react-native';

const ContactUsPage = () => {
  const handleWhatsAppPress = () => {
    const phoneNumber = '+2348065410021'; // Replace with your phone number
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}`);
  };

  const handleEmailPress = () => {
    const emailAddress = 'zakatechsoftware@gmail.com'; // Replace with your email address
    Linking.openURL(`mailto:${emailAddress}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Us</Text>

      <Text style={styles.subtitle}>Phone Number:</Text>
      <TouchableOpacity onPress={handleWhatsAppPress}>
        <Text style={styles.link}>
         +2348065410021
        </Text>
      </TouchableOpacity>
      <Text style={styles.info}>Tap the phone number to message us on WhatsApp</Text>

      <Text style={styles.subtitle}>Email:</Text>
      <TouchableOpacity onPress={handleEmailPress}>
        <Text style={styles.link}>
          zakatechsoftware@gmail.com {/* Replace with your email address */}
        </Text>
      </TouchableOpacity>
      <Text style={styles.info}>Tap the email address to send us an email</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginTop: 5,
  },
  info: {
    marginTop: 5,
    textAlign: 'center',
  },
});

export default ContactUsPage;
