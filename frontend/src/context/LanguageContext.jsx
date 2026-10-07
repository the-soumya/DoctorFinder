import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    findDoctors: "Find Doctors",
    doctorChambers: "Doctor Chambers",
    liveWaitingScreen: "Live TV Display",
    pharmacyDesk: "Pharmacy & Desk",
    attendance: "Attendance (In/Out)",
    doctorsContacts: "Doctors & Contacts",
    myAppointments: "My Appointments",
    digitalRx: "Digital Prescriptions",
    nowCalling: "NOW CALLING",
    nextInLine: "NEXT IN LINE",
    waitingInLobby: "Waiting in Lounge",
    inConsultation: "In Consultation",
    completed: "Completed & Exited",
    chamberRoom: "Chamber Room",
    tokenNumber: "Token Number",
    estimatedWait: "Estimated Wait",
    downloadSlip: "Download OPD Slip",
    printRx: "Print Digital Rx",
    doctorSchedule: "Doctor Schedule",
    searchDoctors: "Search Doctors & Chambers",
    fee: "Fee",
    bookNow: "Book Token",
    welcome: "Welcome",
    emergencyHelpline: "Emergency Desk"
  },
  bn: {
    findDoctors: "ডাক্তার খুঁজুন",
    doctorChambers: "চেম্বার সমূহ",
    liveWaitingScreen: "লাইভ টিভি ডিসপ্লে",
    pharmacyDesk: "ফার্মেসি ও ডেস্ক",
    attendance: "উপস্থিতি (ইন/আউট)",
    doctorsContacts: "ডাক্তারদের তালিকা",
    myAppointments: "আমার অ্যাপয়েন্টমেন্ট",
    digitalRx: "প্রেসক্রিপশন (Rx)",
    nowCalling: "বর্তমান রোগী (কলিং)",
    nextInLine: "পরবর্তী রোগী",
    waitingInLobby: "ওয়েটিং লাউঞ্জ",
    inConsultation: "ডাক্তারের কাছে আছেন",
    completed: "পরামর্শ সম্পন্ন",
    chamberRoom: "চেম্বার রুম",
    tokenNumber: "টোকেন নম্বর",
    estimatedWait: "সম্ভাব্য অপেক্ষা",
    downloadSlip: "OPD স্লিপ ডাউনলোড",
    printRx: "প্রেসক্রিপশন প্রিন্ট",
    doctorSchedule: "ডাক্তার বসার সময়",
    searchDoctors: "ডাক্তার ও চেম্বার অনুসন্ধান",
    fee: "ভিজিট ফি",
    bookNow: "টোকেন বুক করুন",
    welcome: "স্বাগতম",
    emergencyHelpline: "জরুরি হেল্পলাইন"
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('aura_preferred_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('aura_preferred_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'bn' : 'en'));
  };

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      toggleLanguage: () => {},
      t: (key) => TRANSLATIONS['en']?.[key] || key
    };
  }
  return context;
}
