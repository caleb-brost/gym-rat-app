import { StyleSheet } from 'react-native';

export const profileStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 10,
    paddingHorizontal: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginRight: 10,
  },
  signOutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  signOutLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#777',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#222',
  },
  link: {
    color: '#007AFF',
    fontSize: 16,
    marginBottom: 8,
  },
  linkSecondary: {
    color: '#555',
    fontSize: 14,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSection: {
    marginBottom: 32,
  },
  avatarButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    position: 'relative',
  },
  avatarPlaceholder: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholderLabel: {
    color: '#555',
    fontSize: 16,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
  },
  avatarOverlayLabel: {
    color: '#fff',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatarHint: {
    marginTop: 12,
    fontSize: 12,
    color: '#777',
  },
  error: {
    color: '#d14343',
    marginBottom: 12,
  },
});
