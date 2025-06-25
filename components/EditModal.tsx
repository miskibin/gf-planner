import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Item } from '../types';

interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: Omit<Item, 'id' | 'createdAt'>) => void;
  item?: Item;
  type: 'events' | 'wishlist' | 'likes';
}

export default function EditModal({ visible, onClose, onSave, item, type }: EditModalProps) {
  const [title, setTitle] = useState(item?.title || '');
  const [date, setDate] = useState(item?.date || '');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(item?.priority || 'medium');
  const [description, setDescription] = useState(item?.description || '');
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    const itemData: Omit<Item, 'id' | 'createdAt'> = {
      title: title.trim(),
      description: description.trim() || undefined,
    };

    if (type === 'events') {
      itemData.date = date.trim() || undefined;
    }

    if (type === 'wishlist') {
      itemData.priority = priority;
    }

    onSave(itemData);
    handleClose();
  };

  const handleClose = () => {
    setTitle(item?.title || '');
    setDate(item?.date || '');
    setPriority(item?.priority || 'medium');
    setDescription(item?.description || '');
    onClose();
  };

  const handleDateConfirm = (selectedDate: Date) => {
    setDate(selectedDate.toISOString().split('T')[0]);
    setDatePickerVisible(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          {type === 'events' && (
            <>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setDatePickerVisible(true)}
              >
                <Text style={{ color: date ? '#222' : '#666', fontSize: 16 }}>
                  {date ? date : 'Pick a date'}
                </Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={datePickerVisible}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={() => setDatePickerVisible(false)}
              />
            </>
          )}

          {type === 'wishlist' && (
            <>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityContainer}>
                {(['high', 'medium', 'low'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityButton,
                      priority === p && styles.priorityButtonActive
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[
                      styles.priorityText,
                      priority === p && styles.priorityTextActive
                    ]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    color: '#222',
    marginBottom: 4,
    marginLeft: 2,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#222',
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  priorityButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priorityText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  priorityTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#22223b',
    alignItems: 'center',
    shadowColor: '#22223b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
