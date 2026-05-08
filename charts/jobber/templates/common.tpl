{{- define "common.env" }}
- name: PULSAR_SERVICE_URL
  value: {{ printf "pulsar://%s-pulsar-broker.%s.svc.cluster.local:6650" .Release.Name .Release.Namespace | quote }}
{{- end }}
