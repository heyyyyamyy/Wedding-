/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isCompleted: boolean;
}

export interface RSVPInfo {
  name: string;
  email?: string;
  phone?: string;
  attending: 'yes' | 'no' | 'unconfirmed';
  guestsCount: number;
  message?: string;
  submittedAt?: string;
}

export interface EventDetail {
  id: string;
  title: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  description: string;
  mapLink: string;
  iconName: string;
}
