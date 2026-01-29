interface HospitalFields {
    name: string;
    phone?: string;
    dist?: number;
    meta_geo_point?: [number, number] | number[]
    geometry?: {
      coordinates?: [number, number] | number[]
    }
    lat?: number
    lon?: number
    [key: string]: any
}

interface Hospital {
    recordid: string;
    fields: HospitalFields;
}

interface Professionnal {
    internist: boolean;
    pmr: boolean;
    rheumatologist: boolean;
    cardiologist: boolean;
    pulmonologist: boolean;
    nephrologist: boolean;
    gasteroenterologist: boolean;
    endocrinologist: boolean;
    dermatologist: boolean;
    ent: boolean;
    gynecologist: boolean;
    urologist: boolean;
    orthopedist: boolean;
    psychologist: boolean;
    neurosurgeon: boolean;
    pediatric_surgeon: boolean;
    orthopedic_surgeon: boolean;
}

interface MockHospitalData {
    name: string;
    place_id: string;
    fire_fighter: boolean;
    social_worker: boolean;
    professionnal: Professionnal;
}

interface MockData {
    hospitals: MockHospitalData[];
}

interface AccessibilityOptions {
    wheelchairAccessibleParking?: boolean;
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
}

interface PlaceDetails {
    formattedAddress?: string;
    accessibilityOptions?: AccessibilityOptions;
}

interface HospitalWithMock extends Hospital {
    mockData?: MockHospitalData;
    placeAddress?: string;
    accessibilityOptions?: AccessibilityOptions;
}

interface AphService {
    name: string;
    code: string;
    isPediatric: boolean;
}

export type { Hospital, Professionnal, AccessibilityOptions, PlaceDetails, MockData, MockHospitalData, HospitalWithMock, AphService };