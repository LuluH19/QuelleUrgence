"use client";

import { useState, useEffect } from 'react';

interface AttendanceData {
  institution: {
    institutionCode: string;
    institutionName: string;
  };
  indicatorCode: string;
  indicatorName: string;
  day: string;
  timeSlot1: number;
  timeSlot2: number;
  timeSlot3: number;
  timeSlot4: number;
  timeSlot5: number;
  timeSlot6: number;
  timeSlot7: number;
  timeSlot8: number;
  timeSlot9: number;
  timeSlot10: number;
  timeSlot11: number;
  timeSlot12: number;
  timeSlot13: number;
  timeSlot14: number;
  timeSlot15: number;
  timeSlot16: number;
  timeSlot17: number;
  timeSlot18: number;
  timeSlot19: number;
  timeSlot20: number;
  timeSlot21: number;
  timeSlot22: number;
  timeSlot23: number;
  timeSlot24: number;
}

type AttendanceApiResponse = AttendanceData[];

async function getAttendance(hospitalCode: string): Promise<AttendanceApiResponse | null> {
  const apiUrl = `/api/attendance/${hospitalCode}`; 
  
  try {
    const res = await fetch(apiUrl);

    if (!res.ok) {
      console.error(`Erreur API d'affluence: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    return data as AttendanceApiResponse;
  } catch (error) {
    console.error("Échec de la récupération des données d'affluence", error);
    return null;
  }
}

function formatMinutes(minutes: number | null): string {
  if (minutes === null) {
    return 'N/A';
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  const paddedMinutes = remainingMinutes < 10 ? `0${remainingMinutes}` : remainingMinutes;
  return `${hours}h${paddedMinutes}`;
}

function StatCard({ title, time, patients }: { title: string; time: number | null; patients: number | null }) {
  return (
    <div className="flex flex-col rounded-lg shadow-md bg-white overflow-hidden">
      <div className="bg-primary text-white p-2 flex items-center justify-center gap-2">
        <h3 className="font-semibold text-sm md:text-base lg:text-lg">{title}</h3>
      </div>
      <div className="p-4 text-center">
        <p className="text-4xl font-bold text-primary">{formatMinutes(time)}</p>
        <p className="text-sm md:text-base lg:text-lg text-black mt-1">{patients !== null ? `${patients} patients présents` : ''}</p>
      </div>
    </div>
  );
}


export default function Attendance({ hospitalCode }: { hospitalCode: string }) {
  const [attendanceData, setAttendanceData] = useState<AttendanceApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getAttendance(hospitalCode);
      setAttendanceData(data);
      setLoading(false);
    }
    fetchData();
  }, [hospitalCode]);

  if (loading) {
    return (
      <div
        className="text-sm text-slate-600 mt-2"
        role="status"
        aria-live="polite"
      >
        Chargement des informations d&apos;affluence...
      </div>
    );
  }

  if (!attendanceData || attendanceData.length === 0) {
    return (
      <div
        className="text-sm text-rose-600 mt-2"
        role="alert"
        aria-live="assertive"
      >
        Affluence non disponible pour ce service.
      </div>
    );
  }

  // Obtenir l'heure actuelle (0-23) et ajouter 1 pour correspondre à timeSlot (1-24)
  const currentHour = new Date().getHours();
  const currentTimeSlotKey = `timeSlot${currentHour + 1}`;

  // Fonction pour extraire une valeur d'un indicateur
  const getValue = (code: string) => {
    const data = attendanceData.find(d => d.indicatorCode === code);
    return data ? (data as any)[currentTimeSlotKey] : null;
  };

  // Extraire toutes les valeurs nécessaires en se basant sur la nouvelle logique
  const seeNurseTime = getValue('PAI'); // TEMPS pour voir l'infirmier
  const seeNursePatients = getValue('DVM'); // PATIENTS en attente de voir l'infirmier
  
  const seeDoctorTime = getValue('PSS');
  const waitingForDoctorPatients = getValue('DVI');
  
  const totalTime = getValue('DPS');
  const totalPatientsInER = getValue('PAM'); // Patients "au sein du SAU" (3ème groupe)

  // Le vrai total est la somme des 3 groupes de patients distincts
  const totalPatientSum = (seeNursePatients ?? 0) + (waitingForDoctorPatients ?? 0) + (totalPatientsInER ?? 0);

  return (
    <section
      className="mt-4 space-y-4"
      aria-label="Affluence détaillée aux urgences"
    >
      <p className="text-center text-sm md:text-base lg:text-lg font-semibold text-black">
        Actuellement,&nbsp;
        <span className="text-xl text-primary font-bold">
          {totalPatientSum > 0 ? totalPatientSum : 'aucune'}
        </span>
        &nbsp;personnes sont prises en charge dans ce service.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          title="Temps avant de voir l'infirmier"
          time={seeNurseTime}
          patients={seeNursePatients}
        />
        <StatCard
          title="Temps avant de voir le médecin"
          time={seeDoctorTime}
          patients={waitingForDoctorPatients}
        />
        <StatCard
          title="Temps avant de quitter le service"
          time={totalTime}
          patients={totalPatientsInER}
        />
      </div>
      <p className="text-xs text-slate-500 text-center">
        Estimations basées sur les données moyennes à cette heure-ci.
      </p>
    </section>
  );
}