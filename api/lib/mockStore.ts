import type {
  ApiUser,
  ApiProject,
  ApiProjectAssignment,
  ApiDownloadLog,
  ApiLoginLog,
  ApiEmailLog,
} from './types.js';

// Calculate realistic timestamps in UTC
const now = new Date();
const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

export class PortalDataStore {
  users: ApiUser[] = [
    {
      uid: 'admin_user_01',
      userId: 'admin',
      email: process.env.ADMIN_EMAIL || process.env.ADMIN_BOOTSTRAP_EMAIL || '20sgamingrohit@gmail.com',
      name: 'Administrator',
      role: 'admin',
      status: 'active',
      subscriptionStart: tenDaysAgo.toISOString(),
      subscriptionExpiry: new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
      durationDays: 36500,
      createdAt: tenDaysAgo.toISOString(),
      updatedAt: now.toISOString(),
      lastLogin: now.toISOString(),
      rawPassword: process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD || '123',
    },
    {
      uid: 'sub_user_ci1001',
      userId: 'CI1001',
      email: 'rahul@example.com',
      name: 'Rahul Kumar',
      role: 'SUBSCRIBER',
      status: 'ACTIVE',
      subscriptionStart: tenDaysAgo.toISOString(),
      subscriptionExpiry: thirtyDaysLater.toISOString(),
      durationDays: 30,
      createdAt: tenDaysAgo.toISOString(),
      updatedAt: now.toISOString(),
      lastLogin: fiveDaysAgo.toISOString(),
      rawPassword: 'subscriber123',
    },
    {
      uid: 'sub_user_ci1002',
      userId: 'CI1002',
      email: 'priya@example.com',
      name: 'Priya Sharma',
      role: 'SUBSCRIBER',
      status: 'EXPIRED',
      subscriptionStart: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionExpiry: fiveDaysAgo.toISOString(),
      durationDays: 30,
      createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: fiveDaysAgo.toISOString(),
      lastLogin: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      rawPassword: 'subscriber123',
    },
    {
      uid: 'sub_user_ci1003',
      userId: 'CI1003',
      email: 'amit.verma@example.com',
      name: 'Amit Verma',
      role: 'SUBSCRIBER',
      status: 'DISABLED',
      subscriptionStart: tenDaysAgo.toISOString(),
      subscriptionExpiry: thirtyDaysLater.toISOString(),
      durationDays: 30,
      createdAt: tenDaysAgo.toISOString(),
      updatedAt: now.toISOString(),
      disabledReason: 'Account paused upon user request',
      rawPassword: 'subscriber123',
    },
  ];

  projects: ApiProject[] = [
    {
      id: 'proj_esp32_iot_hub',
      title: 'Dual-Motor ESP32 WiFi Telemetry Robot & OLED Hub',
      description: 'Complete high-performance ESP32-WROOM-32 IoT telemetry station with SSD1306 OLED, MQTT control protocol, web server dashboard, and dual motor driver circuitry.',
      category: 'ESP32 Projects',
      thumbnailUrl: '/src/assets/images/thumb_esp32_iot_1794412649331.jpg',
      instructions: '1. Flash the firmware using Arduino IDE with ESP32 board definition v2.0.14.\n2. Configure your WiFi credentials in config.h.\n3. Open Serial Monitor at 115200 baud to view IP address.\n4. Access local IP via any browser on the same network.',
      version: 'v2.4',
      isPublished: true,
      createdAt: tenDaysAgo.toISOString(),
      updatedAt: now.toISOString(),
      files: [
        {
          id: 'file_esp32_firmware',
          projectId: 'proj_esp32_iot_hub',
          fileName: 'ESP32_WiFi_Telemetry_v2.4.ino',
          fileSizeBytes: 42800,
          fileType: 'INO',
          storagePath: 'projects/proj_esp32_iot_hub/ESP32_WiFi_Telemetry_v2.4.ino',
          uploadedAt: tenDaysAgo.toISOString(),
          downloadCount: 14,
        },
        {
          id: 'file_esp32_schematic',
          projectId: 'proj_esp32_iot_hub',
          fileName: 'ESP32_Telemetry_Schematic_HD.pdf',
          fileSizeBytes: 1420500,
          fileType: 'PDF',
          storagePath: 'projects/proj_esp32_iot_hub/ESP32_Telemetry_Schematic_HD.pdf',
          uploadedAt: tenDaysAgo.toISOString(),
          downloadCount: 22,
        },
        {
          id: 'file_esp32_gerber',
          projectId: 'proj_esp32_iot_hub',
          fileName: 'ESP32_Telemetry_Gerber_Files.zip',
          fileSizeBytes: 3840000,
          fileType: 'ZIP',
          storagePath: 'projects/proj_esp32_iot_hub/ESP32_Telemetry_Gerber_Files.zip',
          uploadedAt: tenDaysAgo.toISOString(),
          downloadCount: 18,
        },
      ],
    },
    {
      id: 'proj_arduino_rover',
      title: 'Autonomous Obstacle-Avoidance Robotic Rover',
      description: 'Precision 2WD obstacle avoidance robotic vehicle powered by Arduino Uno, HC-SR04 ultrasonic distance sensor on a micro-servo scan bracket, and L298N H-Bridge shield.',
      category: 'Arduino Projects',
      thumbnailUrl: '/src/assets/images/thumb_arduino_robotics_1794412650289.jpg',
      instructions: '1. Mount components on acrylic chassis standoffs.\n2. Connect HC-SR04 Echo to pin 12 and Trig to pin 11.\n3. Upload Rover_Main_Firmware.ino via USB.\n4. Power with 2x 18650 3.7V batteries in series (7.4V).',
      version: 'v1.8',
      isPublished: true,
      createdAt: eightDaysAgo(now),
      updatedAt: now.toISOString(),
      files: [
        {
          id: 'file_rover_firmware',
          projectId: 'proj_arduino_rover',
          fileName: 'Rover_Main_Firmware_v1.8.ino',
          fileSizeBytes: 18500,
          fileType: 'INO',
          storagePath: 'projects/proj_arduino_rover/Rover_Main_Firmware_v1.8.ino',
          uploadedAt: eightDaysAgo(now),
          downloadCount: 29,
        },
        {
          id: 'file_rover_chassis_stl',
          projectId: 'proj_arduino_rover',
          fileName: 'Rover_3D_Print_Stands_STL.zip',
          fileSizeBytes: 5610000,
          fileType: 'ZIP',
          storagePath: 'projects/proj_arduino_rover/Rover_3D_Print_Stands_STL.zip',
          uploadedAt: eightDaysAgo(now),
          downloadCount: 12,
        },
      ],
    },
    {
      id: 'proj_custom_pcb_board',
      title: 'Multi-Layer High-Frequency Inverter PCB',
      description: 'Commercial grade 4-layer power inverter board layout designed in KiCad 8.0, featuring impedance-matched traces, gold-plated ENIG finish pads, and optimized thermal vias.',
      category: 'PCB Projects',
      thumbnailUrl: '/src/assets/images/thumb_custom_pcb_1794412649367.jpg',
      instructions: '1. Extract Gerber files into any PCB CAM viewer (JLCPCB, PCBWay).\n2. Select 1.6mm thickness, FR4, 1oz copper, Black solder mask, ENIG gold finish.\n3. Verify drilling files and check layer stackup in KiCad before ordering production batches.',
      version: 'v3.0',
      isPublished: true,
      createdAt: sevenDaysAgo(now),
      updatedAt: now.toISOString(),
      files: [
        {
          id: 'file_pcb_gerbers',
          projectId: 'proj_custom_pcb_board',
          fileName: 'Gerber_Production_Package_REV3.zip',
          fileSizeBytes: 8420000,
          fileType: 'ZIP',
          storagePath: 'projects/proj_custom_pcb_board/Gerber_Production_Package_REV3.zip',
          uploadedAt: sevenDaysAgo(now),
          downloadCount: 35,
        },
        {
          id: 'file_pcb_bom',
          projectId: 'proj_custom_pcb_board',
          fileName: 'BOM_Component_List_REV3.txt',
          fileSizeBytes: 7200,
          fileType: 'TXT',
          storagePath: 'projects/proj_custom_pcb_board/BOM_Component_List_REV3.txt',
          uploadedAt: sevenDaysAgo(now),
          downloadCount: 19,
        },
        {
          id: 'file_pcb_schematic',
          projectId: 'proj_custom_pcb_board',
          fileName: 'Inverter_Circuit_Schematic.pdf',
          fileSizeBytes: 2150000,
          fileType: 'PDF',
          storagePath: 'projects/proj_custom_pcb_board/Inverter_Circuit_Schematic.pdf',
          uploadedAt: sevenDaysAgo(now),
          downloadCount: 27,
        },
      ],
    },
  ];

  assignments: ApiProjectAssignment[] = [
    {
      id: 'asgn_01',
      userId: 'sub_user_ci1001',
      projectId: 'proj_esp32_iot_hub',
      assignedAt: tenDaysAgo.toISOString(),
      assignedBy: 'ADMIN01',
    },
    {
      id: 'asgn_02',
      userId: 'sub_user_ci1001',
      projectId: 'proj_arduino_rover',
      assignedAt: eightDaysAgo(now),
      assignedBy: 'ADMIN01',
    },
    {
      id: 'asgn_03',
      userId: 'sub_user_ci1001',
      projectId: 'proj_custom_pcb_board',
      assignedAt: sevenDaysAgo(now),
      assignedBy: 'ADMIN01',
    },
    {
      id: 'asgn_04',
      userId: 'sub_user_ci1002',
      projectId: 'proj_arduino_rover',
      assignedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      assignedBy: 'ADMIN01',
    },
  ];

  downloads: ApiDownloadLog[] = [
    {
      id: 'dl_01',
      userId: 'sub_user_ci1001',
      userCode: 'CI1001',
      userName: 'Rahul Kumar',
      projectId: 'proj_esp32_iot_hub',
      projectTitle: 'Dual-Motor ESP32 WiFi Telemetry Robot & OLED Hub',
      fileId: 'file_esp32_firmware',
      fileName: 'ESP32_WiFi_Telemetry_v2.4.ino',
      fileSize: 42800,
      ipAddress: '103.212.14.88',
      timestamp: fiveDaysAgo.toISOString(),
      status: 'SUCCESS',
    },
    {
      id: 'dl_02',
      userId: 'sub_user_ci1001',
      userCode: 'CI1001',
      userName: 'Rahul Kumar',
      projectId: 'proj_esp32_iot_hub',
      projectTitle: 'Dual-Motor ESP32 WiFi Telemetry Robot & OLED Hub',
      fileId: 'file_esp32_gerber',
      fileName: 'ESP32_Telemetry_Gerber_Files.zip',
      fileSize: 3840000,
      ipAddress: '103.212.14.88',
      timestamp: fiveDaysAgo.toISOString(),
      status: 'SUCCESS',
    },
  ];

  loginLogs: ApiLoginLog[] = [
    {
      id: 'log_01',
      userId: 'admin_user_01',
      userCode: 'ADMIN01',
      email: '20sgamingrohit@gmail.com',
      timestamp: now.toISOString(),
      ipAddress: '103.21.244.12',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'SUCCESS',
    },
    {
      id: 'log_02',
      userId: 'sub_user_ci1001',
      userCode: 'CI1001',
      email: 'rahul@example.com',
      timestamp: fiveDaysAgo.toISOString(),
      ipAddress: '103.212.14.88',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      status: 'SUCCESS',
    },
  ];

  emailLogs: ApiEmailLog[] = [
    {
      id: 'eml_01',
      recipientEmail: 'rahul@example.com',
      subject: 'Welcome to Creative Inventor Project Portal - Your Credentials',
      templateType: 'WELCOME',
      sentAt: tenDaysAgo.toISOString(),
      status: 'SENT',
    },
  ];
}

function eightDaysAgo(d: Date) {
  return new Date(d.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString();
}
function sevenDaysAgo(d: Date) {
  return new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

export const globalStore = new PortalDataStore();
